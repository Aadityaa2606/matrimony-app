import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserDocument } from '../types';

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<FirebaseUser> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update the user's display name
  await updateProfile(user, { displayName });

  // Create user document in Firestore
  const userDoc: UserDocument = {
    email,
    displayName,
    photoURL: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isProfileComplete: false,
    isVerified: false,
  };

  await setDoc(doc(db, 'users', user.uid), userDoc);

  return user;
};

// Sign in with email and password
export const signIn = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign out
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// Get user document from Firestore
export const getUserDocument = async (uid: string): Promise<UserDocument | null> => {
  const userDocRef = doc(db, 'users', uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data() as UserDocument;
  }

  return null;
};

// Update user document
export const updateUserDocument = async (
  uid: string,
  data: Partial<UserDocument>
): Promise<void> => {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    ...data,
    updatedAt: new Date(),
  });
};
