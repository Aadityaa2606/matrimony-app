import * as functions from "firebase-functions";
import { db } from "./index";

// Trigger: When a profile is created or updated
export const onProfileWrite = functions.firestore
  .document("profiles/{profileId}")
  .onWrite(async (change, context) => {
    const { profileId } = context.params;

    // If profile is deleted
    if (!change.after.exists) {
      console.log(`Profile deleted: ${profileId}`);
      return null;
    }

    const profileData = change.after.data();
    if (!profileData) return null;

    // Update the user's isProfileComplete status
    const userId = profileData.userId;
    const requiredFields = [
      "firstName",
      "lastName",
      "dateOfBirth",
      "gender",
      "religion",
      "occupation",
      "education",
      "bio",
    ];

    const isComplete = requiredFields.every(
      (field) => profileData[field] !== undefined && profileData[field] !== null && profileData[field] !== ""
    );

    await db.collection("users").doc(userId).update({
      isProfileComplete: isComplete,
      updatedAt: new Date(),
    });

    console.log(`Profile ${profileId} completeness updated: ${isComplete}`);
    return null;
  });

// Callable function: Search profiles with filters
export const searchProfiles = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to search profiles"
    );
  }

  const { gender, minAge: _minAge, maxAge: _maxAge, religion, location: _location, limit = 20, lastDocId } = data;

  let query = db.collection("profiles").where("isVisible", "==", true);

  if (gender) {
    query = query.where("gender", "==", gender);
  }

  if (religion) {
    query = query.where("religion", "==", religion);
  }

  // Note: Complex age filtering would need to be done client-side or with date ranges
  // This is a simplified example

  query = query.limit(limit);

  if (lastDocId) {
    const lastDoc = await db.collection("profiles").doc(lastDocId).get();
    if (lastDoc.exists) {
      query = query.startAfter(lastDoc);
    }
  }

  const snapshot = await query.get();
  const profiles = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return { profiles, hasMore: profiles.length === limit };
});
