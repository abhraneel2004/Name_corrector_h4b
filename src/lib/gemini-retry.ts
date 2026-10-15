// Gemini answers 503 when the model is overloaded; that clears within seconds, so retry with backoff.
// 429 means a quota is used up (on the free tier, a daily limit), so retrying would not help.

export const GEMINI_MAX_RETRIES = 3;

export const geminiBackoffMs = (attempt: number) => 2000 * 2 ** attempt;

export function isGeminiOverloaded(error: unknown): boolean {
  const e = error as { status?: number; message?: string } | undefined;
  return e?.status === 503 || /\b503\b|high demand|overloaded/i.test(String(e?.message ?? ''));
}

export async function withGeminiRetry<T>(call: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await call();
    } catch (error) {
      if (!isGeminiOverloaded(error) || attempt >= GEMINI_MAX_RETRIES) throw error;
      await new Promise((resolve) => setTimeout(resolve, geminiBackoffMs(attempt)));
    }
  }
}

// User-facing explanation for a failed Gemini call, by HTTP status
export function geminiErrorMessage(status: number): string {
  if (status === 429) return 'The AI service quota has been used up. Try again later or contact your administrator.';
  if (status === 503) return 'The AI service is busy. Try again in a minute.';
  return `The AI request failed (status ${status}).`;
}
