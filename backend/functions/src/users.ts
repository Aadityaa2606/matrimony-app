import * as functions from "firebase-functions";
import { db } from "./index";

// Trigger: When a new user is created in Firebase Auth
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;

  // Create a user document in Firestore
  await db.collection("users").doc(uid).set({
    email,
    displayName: displayName || null,
    photoURL: photoURL || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isProfileComplete: false,
    isVerified: false,
  });

  console.log(`User document created for: ${uid}`);
  return null;
});

// Trigger: When a user is deleted from Firebase Auth
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const { uid } = user;

  // Delete user's Firestore documents
  const batch = db.batch();

  // Delete user document
  batch.delete(db.collection("users").doc(uid));

  // Delete user's profile
  const profileSnapshot = await db
    .collection("profiles")
    .where("userId", "==", uid)
    .get();

  profileSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  console.log(`User data deleted for: ${uid}`);
  return null;
});
