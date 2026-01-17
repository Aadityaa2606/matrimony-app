import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Match, Message, Conversation } from '../types';

const MATCHES_COLLECTION = 'matches';
const MESSAGES_COLLECTION = 'messages';

// Get all matches for a user
export const getMatches = async (userId: string): Promise<Match[]> => {
  // Get matches where user is user1
  const q1 = query(
    collection(db, MATCHES_COLLECTION),
    where('user1Id', '==', userId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );

  // Get matches where user is user2
  const q2 = query(
    collection(db, MATCHES_COLLECTION),
    where('user2Id', '==', userId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );

  const [snapshot1, snapshot2] = await Promise.all([
    getDocs(q1),
    getDocs(q2),
  ]);

  const matches1 = snapshot1.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Match[];

  const matches2 = snapshot2.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Match[];

  // Combine and sort by date
  return [...matches1, ...matches2].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// Get the other user's ID in a match
export const getMatchedUserId = (match: Match, currentUserId: string): string => {
  return match.user1Id === currentUserId ? match.user2Id : match.user1Id;
};

// Subscribe to matches (real-time updates)
export const subscribeToMatches = (
  userId: string,
  onUpdate: (matches: Match[]) => void
): Unsubscribe => {
  const q1 = query(
    collection(db, MATCHES_COLLECTION),
    where('user1Id', '==', userId),
    where('status', '==', 'active')
  );

  const q2 = query(
    collection(db, MATCHES_COLLECTION),
    where('user2Id', '==', userId),
    where('status', '==', 'active')
  );

  let matches1: Match[] = [];
  let matches2: Match[] = [];

  const unsubscribe1 = onSnapshot(q1, (snapshot) => {
    matches1 = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Match[];
    onUpdate([...matches1, ...matches2]);
  });

  const unsubscribe2 = onSnapshot(q2, (snapshot) => {
    matches2 = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Match[];
    onUpdate([...matches1, ...matches2]);
  });

  return () => {
    unsubscribe1();
    unsubscribe2();
  };
};

// Get conversation ID between two users
export const getConversationId = (userId1: string, userId2: string): string => {
  // Create a consistent conversation ID regardless of order
  return [userId1, userId2].sort().join('_');
};

// Send a message
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  text: string,
  imageUrl?: string
): Promise<string> => {
  const conversationId = getConversationId(senderId, receiverId);
  
  const messageData = {
    senderId,
    receiverId,
    text,
    imageUrl: imageUrl || null,
    isRead: false,
    createdAt: serverTimestamp(),
  };

  const messagesRef = collection(db, MESSAGES_COLLECTION, conversationId, 'messages');
  const docRef = await addDoc(messagesRef, messageData);
  
  return docRef.id;
};

// Get messages for a conversation
export const getMessages = async (
  userId1: string,
  userId2: string,
  messageLimit: number = 50
): Promise<Message[]> => {
  const conversationId = getConversationId(userId1, userId2);
  
  const q = query(
    collection(db, MESSAGES_COLLECTION, conversationId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(messageLimit)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }) as Message)
    .reverse();
};

// Subscribe to messages (real-time chat)
export const subscribeToMessages = (
  userId1: string,
  userId2: string,
  onUpdate: (messages: Message[]) => void
): Unsubscribe => {
  const conversationId = getConversationId(userId1, userId2);
  
  const q = query(
    collection(db, MESSAGES_COLLECTION, conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    onUpdate(messages);
  });
};

// Get match count for a user
export const getMatchCount = async (userId: string): Promise<number> => {
  const matches = await getMatches(userId);
  return matches.length;
};
