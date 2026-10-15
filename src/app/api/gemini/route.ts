import { NextRequest, NextResponse } from 'next/server';
import { AuthError, getGeminiApiKey, requireUser } from '@/lib/server-auth';
import { RateLimitError, consumeLimit } from '@/lib/rate-limit';
import { GEMINI_MAX_RETRIES, geminiBackoffMs, geminiErrorMessage } from '@/lib/gemini-retry';

export const runtime = 'nodejs';
export const maxDuration = 120;

// Large enough for a full dataset as query context, small enough to bound cost
const MAX_PROMPT_CHARS = 500_000;

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    consumeLimit('query', user.uid);
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

  const body = await request.json().catch(() => null);
  const prompt = typeof body?.prompt === 'string' ? body.prompt : '';
  if (!prompt.trim()) {
    return NextResponse.json({ error: 'A prompt is required' }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return NextResponse.json({ error: 'The request is too large. Try fewer records.' }, { status: 413 });
  }
  const requestedTokens = Number(body?.maxOutputTokens);
  const maxOutputTokens = Number.isFinite(requestedTokens)
    ? Math.min(Math.max(Math.round(requestedTokens), 256), 4096)
    : 2048;

  // Create an AbortController with a longer timeout (120 seconds instead of default)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

  try {
    let response: Response;
    // Retry when the model is overloaded (503); a 429 quota error would not recover
    for (let attempt = 0; ; attempt++) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Only the prompt comes from the client; model settings are fixed here
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              topK: 40,
              topP: 0.8,
              maxOutputTokens,
              // Thinking tokens count against maxOutputTokens and would truncate answers
              thinkingConfig: { thinkingLevel: 'minimal' },
            },
          }),
          signal: controller.signal,
        }
      );
      if (attempt >= GEMINI_MAX_RETRIES || response.status !== 503) break;
      await new Promise((resolve) => setTimeout(resolve, geminiBackoffMs(attempt)));
    }

    if (!response.ok) {
      console.error('Gemini request failed with status', response.status);
      return NextResponse.json({ error: geminiErrorMessage(response.status) }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out after 120 seconds' },
        { status: 504 }
      );
    }
    console.error('Error in Gemini API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
