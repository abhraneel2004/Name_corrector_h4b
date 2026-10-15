import { createRemoteJWKSet, jwtVerify } from 'jose';

// Verifies Firebase ID tokens on the server against Google's public signing keys.
// See https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export type VerifiedUser = {
  uid: string;
  email: string;
};

// status: 401 = not signed in or bad token; 403 = signed in but not allowed (guest, unverified email)
export class AuthError extends Error {
  constructor(message: string, public status: 401 | 403 = 401) {
    super(message);
  }
}

export async function verifyIdToken(idToken: string | null | undefined): Promise<VerifiedUser> {
  if (!idToken) {
    throw new AuthError('Sign in required');
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('Firebase project ID is not configured on the server');
  }

  try {
    const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
      algorithms: ['RS256'],
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      throw new AuthError('Invalid session');
    }
    if (typeof payload.auth_time === 'number' && payload.auth_time * 1000 > Date.now() + 60_000) {
      throw new AuthError('Invalid session');
    }

    // Accounts are open to anyone, so require a real, verified email address for accountability
    const firebaseClaims = payload.firebase as { sign_in_provider?: string } | undefined;
    if (firebaseClaims?.sign_in_provider === 'anonymous' || typeof payload.email !== 'string') {
      throw new AuthError('Guest access is not permitted. Sign in with a registered account.', 403);
    }
    if (payload.email_verified !== true) {
      throw new AuthError('Verify your email address before using the console.', 403);
    }

    return { uid: payload.sub, email: payload.email };
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError('Your session is invalid or has expired. Sign in again.');
  }
}

// Reads and verifies the "Authorization: Bearer <Firebase ID token>" header
export async function requireUser(request: Request): Promise<VerifiedUser> {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : null;
  return verifyIdToken(token);
}

// Gemini key for server-side calls only; never expose it with a NEXT_PUBLIC_ prefix
export function getGeminiApiKey(): string | undefined {
  return process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
}
