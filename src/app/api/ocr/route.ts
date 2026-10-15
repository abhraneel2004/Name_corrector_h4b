import { NextRequest, NextResponse } from 'next/server';
import {
  OCR_ACCEPTED_TYPES,
  OCR_FIELDS,
  OCR_FIELD_KEYS,
  OCR_MAX_FILE_BYTES,
  OCR_MAX_FILE_MB,
  type OcrRecord,
  type OcrResponse,
} from '@/lib/ocr';
import { AuthError, getGeminiApiKey, requireUser } from '@/lib/server-auth';
import { RateLimitError, consumeLimit } from '@/lib/rate-limit';
import { GEMINI_MAX_RETRIES, geminiBackoffMs, geminiErrorMessage } from '@/lib/gemini-retry';

export const runtime = 'nodejs';
export const maxDuration = 120;

const PROMPT = `You are digitising handwritten Indian police case documents (FIRs, case diaries, arrest memos, charge sheets) into a records database.

Read the attached document and extract the case records.

Rules:
- Return one record per accused person. If several accused are named, return one record for each and repeat the shared case fields.
- Write every value in English (Latin script). Transliterate names written in Hindi, Bengali or any other Indian script using the most common English spelling. Never translate a name.
- Put the accused person's full name exactly as written, in its original script, in nameAsWritten.
- Format dates as YYYY-MM-DD.
- Use an empty string for any field that is not in the document. Never guess or invent a value.
- List in uncertainFields every field whose handwriting you could not read with confidence, or whose value you had to infer.
- Use printed form labels, stamps and letterheads only as context for what a value means.
- If the document contains no case record, return an empty records array.

Fields:
${OCR_FIELDS.map((f) => `- ${f.key}: ${f.hint}`).join('\n')}`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    language: { type: 'STRING', description: 'Main language and script of the handwriting' },
    legibility: { type: 'STRING', enum: ['good', 'fair', 'poor'] },
    records: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          ...Object.fromEntries(OCR_FIELDS.map((f) => [f.key, { type: 'STRING', description: f.hint }])),
          nameAsWritten: { type: 'STRING' },
          uncertainFields: { type: 'ARRAY', items: { type: 'STRING', enum: OCR_FIELD_KEYS } },
        },
        required: [...OCR_FIELD_KEYS, 'nameAsWritten', 'uncertainFields'],
      },
    },
  },
  required: ['language', 'legibility', 'records'],
};

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

// Coerce the model output into the shape the client expects
function normaliseResponse(parsed: any): OcrResponse {
  const records: OcrRecord[] = (Array.isArray(parsed?.records) ? parsed.records : [])
    .map((r: any) => {
      const record = { nameAsWritten: asString(r?.nameAsWritten) } as OcrRecord;
      OCR_FIELD_KEYS.forEach((key) => {
        record[key] = asString(r?.[key]);
      });
      record.uncertainFields = Array.isArray(r?.uncertainFields)
        ? r.uncertainFields.filter((k: any) => OCR_FIELD_KEYS.includes(k))
        : [];
      return record;
    })
    .filter((r: OcrRecord) => OCR_FIELD_KEYS.some((key) => r[key]));

  return {
    language: asString(parsed?.language),
    legibility: ['good', 'fair', 'poor'].includes(parsed?.legibility) ? parsed.legibility : 'fair',
    records,
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    consumeLimit('ocr', user.uid);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: 429, headers: { 'Retry-After': String(error.retryAfterSeconds) } }
      );
    }
    throw error;
  }

  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return NextResponse.json({ error: 'No API key found for Google Gemini' }, { status: 500 });
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get('file');
  } catch {
    return NextResponse.json({ error: 'Expected a multipart form upload' }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  if (!OCR_ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type "${file.type || 'unknown'}". Use JPG, PNG, WEBP, HEIC or PDF.` },
      { status: 415 }
    );
  }
  if (file.size > OCR_MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `File is larger than the ${OCR_MAX_FILE_MB} MB limit` },
      { status: 413 }
    );
  }

  const data = Buffer.from(await file.arrayBuffer()).toString('base64');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 110000);

  const requestBody = JSON.stringify({
    contents: [
      {
        parts: [
          { inlineData: { mimeType: file.type, data } },
          { text: PROMPT },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      maxOutputTokens: 8192,
      // Handwriting benefits from some reasoning, but keep latency down
      thinkingConfig: { thinkingLevel: 'low' },
    },
  });

  try {
    let response: Response;
    // Retry when the model is overloaded (503); a 429 quota error would not recover
    for (let attempt = 0; ; attempt++) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
          signal: controller.signal,
        }
      );
      if (attempt >= GEMINI_MAX_RETRIES || response.status !== 503) break;
      await new Promise((resolve) => setTimeout(resolve, geminiBackoffMs(attempt)));
    }

    if (!response.ok) {
      console.error('Gemini OCR request failed with status', response.status);
      return NextResponse.json({ error: geminiErrorMessage(response.status) }, { status: response.status });
    }

    const result = await response.json();
    const text = (result.candidates?.[0]?.content?.parts ?? [])
      .filter((part: any) => part.text && !part.thought)
      .map((part: any) => part.text)
      .join('');

    if (!text) {
      return NextResponse.json({ error: 'The AI returned no text for this document' }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Could not parse the extracted records' }, { status: 502 });
    }

    return NextResponse.json(normaliseResponse(parsed));
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'OCR timed out. Try a smaller file or fewer pages.' }, { status: 504 });
    }
    console.error('Error in OCR route:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}
