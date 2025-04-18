import { 
  User, 
  signInAnonymously as firebaseSignInAnonymously,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Signs in user anonymously
 * @returns Promise that resolves with the user credential
 */
export const signInAnonymously = async () => {
  try {
    const userCredential = await firebaseSignInAnonymously(auth);
    return userCredential;
  } catch (error) {
    console.error('Anonymous sign in failed:', error);
    throw error;
  }
};

/**
 * Checks if a user is currently signed in
 * @returns Promise that resolves with the current user or null
 */
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Checks if the current user is anonymous
 * @returns Promise that resolves with boolean indicating if user is anonymous
 */
export const isAnonymousUser = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user?.isAnonymous;
}; 