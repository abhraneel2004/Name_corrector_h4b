import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const GOOGLE_GENAI_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY;

    if (!GOOGLE_GENAI_API_KEY) {
      return NextResponse.json(
        { error: 'No API key found for Google Gemini' },
        { status: 500 }
      );
    }

    // Create an AbortController with a longer timeout (120 seconds instead of default)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GOOGLE_GENAI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId); // Clear the timeout if the request completes

      if (!response.ok) {
        return NextResponse.json(
          { error: `API request failed with status ${response.status}` },
          { status: response.status }
        );
      }

      const result = await response.json();
      return NextResponse.json(result);
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out after 120 seconds' },
          { status: 504 }
        );
      }
      throw fetchError; // Re-throw for the outer catch block
    } finally {
      clearTimeout(timeoutId); // Ensure the timeout is cleared
    }
  } catch (error: any) {
    console.error('Error in Gemini API route:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 