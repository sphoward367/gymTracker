import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth';
import type { User, NextOrObserver } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const authService = {
  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  signOut() {
    return firebaseSignOut(auth);
  },

  onAuthStateChanged(callback: NextOrObserver<User>) {
    return firebaseOnAuthStateChanged(auth, callback);
  },

  getCurrentUser() {
    return auth.currentUser;
  },
};
