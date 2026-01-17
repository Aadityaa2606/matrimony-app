import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Interest, InterestStatus } from '../types';

const INTERESTS_COLLECTION = 'interests';

// Send an interest to another user
export const sendInterest = async (
  fromUserId: string,
  toUserId: string,
  message?: string
): Promise<string> => {
  // Check if interest already exists
  const existingInterest = await getExistingInterest(fromUserId, toUserId);
  if (existingInterest) {
    throw new Error('Interest already sent to this user');
  }

  const interestData = {
    fromUserId,
    toUserId,
    message: message || null,
    status: 'pending' as InterestStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await addDoc(collection(db, INTERESTS_COLLECTION), interestData);
  return docRef.id;
};

// Check if interest already exists between two users
export const getExistingInterest = async (
  fromUserId: string,
  toUserId: string
): Promise<Interest | null> => {
  const q = query(
    collection(db, INTERESTS_COLLECTION),
    where('fromUserId', '==', fromUserId),
    where('toUserId', '==', toUserId)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Interest;
};

// Accept an interest
export const acceptInterest = async (interestId: string): Promise<void> => {
  const interestRef = doc(db, INTERESTS_COLLECTION, interestId);
  await updateDoc(interestRef, {
    status: 'accepted',
    updatedAt: new Date(),
  });
};

// Decline an interest
export const declineInterest = async (interestId: string): Promise<void> => {
  const interestRef = doc(db, INTERESTS_COLLECTION, interestId);
  await updateDoc(interestRef, {
    status: 'declined',
    updatedAt: new Date(),
  });
};

// Get received interests for a user
export const getReceivedInterests = async (userId: string): Promise<Interest[]> => {
  const q = query(
    collection(db, INTERESTS_COLLECTION),
    where('toUserId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interest[];
};

// Get sent interests for a user
export const getSentInterests = async (userId: string): Promise<Interest[]> => {
  const q = query(
    collection(db, INTERESTS_COLLECTION),
    where('fromUserId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interest[];
};

// Subscribe to received interests (real-time updates)
export const subscribeToReceivedInterests = (
  userId: string,
  onUpdate: (interests: Interest[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, INTERESTS_COLLECTION),
    where('toUserId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const interests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interest[];
    onUpdate(interests);
  });
};

// Get interest stats for a user
export const getInterestStats = async (
  userId: string
): Promise<{ received: number; sent: number; accepted: number }> => {
  // Received pending interests
  const receivedQuery = query(
    collection(db, INTERESTS_COLLECTION),
    where('toUserId', '==', userId),
    where('status', '==', 'pending')
  );
  const receivedSnapshot = await getDocs(receivedQuery);

  // Sent interests
  const sentQuery = query(
    collection(db, INTERESTS_COLLECTION),
    where('fromUserId', '==', userId)
  );
  const sentSnapshot = await getDocs(sentQuery);

  // Accepted interests (mutual matches)
  const acceptedSentQuery = query(
    collection(db, INTERESTS_COLLECTION),
    where('fromUserId', '==', userId),
    where('status', '==', 'accepted')
  );
  const acceptedSentSnapshot = await getDocs(acceptedSentQuery);

  const acceptedReceivedQuery = query(
    collection(db, INTERESTS_COLLECTION),
    where('toUserId', '==', userId),
    where('status', '==', 'accepted')
  );
  const acceptedReceivedSnapshot = await getDocs(acceptedReceivedQuery);

  return {
    received: receivedSnapshot.size,
    sent: sentSnapshot.size,
    accepted: acceptedSentSnapshot.size + acceptedReceivedSnapshot.size,
  };
};
