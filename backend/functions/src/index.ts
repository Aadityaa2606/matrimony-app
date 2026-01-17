import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export Firestore and Auth instances for use in other modules
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

// Re-export functions from modules
export * from "./users";
export * from "./profiles";
export * from "./interests";
