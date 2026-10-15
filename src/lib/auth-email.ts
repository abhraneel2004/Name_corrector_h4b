import { sendEmailVerification, type User } from 'firebase/auth';

// Sends the account verification email, returning the user to the console afterwards.
// Falls back to no continue URL if this domain isn't in Firebase's authorised domains.
export async function sendVerificationEmail(user: User): Promise<void> {
  try {
    await sendEmailVerification(user, { url: `${window.location.origin}/app` });
  } catch (err: any) {
    if (err?.code !== 'auth/unauthorized-continue-uri' && err?.code !== 'auth/invalid-continue-uri') throw err;
    await sendEmailVerification(user);
  }
}
