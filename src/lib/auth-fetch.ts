import { auth } from '@/lib/firebase';

// Firebase ID token for the signed-in user, sent to server routes and actions
export async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You need to be signed in to do this.');
  }
  return user.getIdToken();
}

// fetch() that attaches the user's ID token so server routes can verify the caller
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${await getIdToken()}`);
  return fetch(input, { ...init, headers });
}
