import * as functions from "firebase-functions";
import { db } from "./index";

// Types for interest status
type InterestStatus = "pending" | "accepted" | "declined";

interface Interest {
  fromUserId: string;
  toUserId: string;
  status: InterestStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Trigger: When an interest request is created
export const onInterestCreated = functions.firestore
  .document("interests/{interestId}")
  .onCreate(async (snapshot, context) => {
    const { interestId } = context.params;
    const interest = snapshot.data() as Interest;

    // Create a notification for the recipient
    await db.collection("notifications").add({
      userId: interest.toUserId,
      type: "new_interest",
      title: "New Interest Received",
      message: "Someone has shown interest in your profile!",
      data: {
        interestId,
        fromUserId: interest.fromUserId,
      },
      isRead: false,
      createdAt: new Date(),
    });

    console.log(`Interest notification created for: ${interest.toUserId}`);
    return null;
  });

// Trigger: When an interest request is updated (accepted/declined)
export const onInterestUpdated = functions.firestore
  .document("interests/{interestId}")
  .onUpdate(async (change, context) => {
    const { interestId } = context.params;
    const beforeData = change.before.data() as Interest;
    const afterData = change.after.data() as Interest;

    // Check if status changed
    if (beforeData.status === afterData.status) {
      return null;
    }

    // If interest was accepted, create a match
    if (afterData.status === "accepted") {
      // Create a match document
      await db.collection("matches").add({
        user1Id: afterData.fromUserId,
        user2Id: afterData.toUserId,
        interestId,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Notify the sender that their interest was accepted
      await db.collection("notifications").add({
        userId: afterData.fromUserId,
        type: "interest_accepted",
        title: "Interest Accepted!",
        message: "Your interest has been accepted. You can now start a conversation!",
        data: {
          interestId,
          matchedUserId: afterData.toUserId,
        },
        isRead: false,
        createdAt: new Date(),
      });

      console.log(`Match created between ${afterData.fromUserId} and ${afterData.toUserId}`);
    }

    // If interest was declined, notify the sender
    if (afterData.status === "declined") {
      await db.collection("notifications").add({
        userId: afterData.fromUserId,
        type: "interest_declined",
        title: "Interest Response",
        message: "Unfortunately, your interest was not accepted.",
        data: {
          interestId,
        },
        isRead: false,
        createdAt: new Date(),
      });
    }

    return null;
  });

// Callable function: Send interest request
export const sendInterest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to send interest",
    );
  }

  const { toUserId, message } = data;
  const fromUserId = context.auth.uid;

  if (fromUserId === toUserId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Cannot send interest to yourself",
    );
  }

  // Check if interest already exists
  const existingInterest = await db
    .collection("interests")
    .where("fromUserId", "==", fromUserId)
    .where("toUserId", "==", toUserId)
    .get();

  if (!existingInterest.empty) {
    throw new functions.https.HttpsError(
      "already-exists",
      "Interest already sent to this user",
    );
  }

  // Create the interest
  const interestRef = await db.collection("interests").add({
    fromUserId,
    toUserId,
    message: message || null,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { interestId: interestRef.id, success: true };
});
