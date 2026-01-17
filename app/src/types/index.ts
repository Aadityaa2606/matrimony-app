// User type from Firebase Auth
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
}

// User document in Firestore
export interface UserDocument {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  updatedAt: Date;
  isProfileComplete: boolean;
  isVerified: boolean;
}

// Gender options
export type Gender = 'male' | 'female';

// Marital status options
export type MaritalStatus = 'never_married' | 'divorced' | 'widowed' | 'awaiting_divorce';

// Profile document in Firestore
export interface Profile {
  id: string;
  userId: string;
  
  // Basic Info
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  maritalStatus: MaritalStatus;
  
  // Physical Attributes
  height: number; // in cm
  weight?: number; // in kg
  complexion?: string;
  bodyType?: string;
  
  // Religious & Cultural
  religion: string;
  caste?: string;
  subCaste?: string;
  motherTongue: string;
  
  // Education & Career
  education: string;
  educationDetails?: string;
  occupation: string;
  employerName?: string;
  annualIncome?: string;
  
  // Location
  country: string;
  state: string;
  city: string;
  
  // Family
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  siblings?: number;
  familyType?: 'joint' | 'nuclear';
  familyStatus?: 'middle_class' | 'upper_middle_class' | 'rich' | 'affluent';
  
  // About
  bio: string;
  hobbies?: string[];
  
  // Partner Preferences
  partnerPreferences?: PartnerPreferences;
  
  // Photos
  photos: string[]; // URLs to Firebase Storage
  
  // Visibility
  isVisible: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Partner preferences
export interface PartnerPreferences {
  ageMin: number;
  ageMax: number;
  heightMin?: number;
  heightMax?: number;
  maritalStatus?: MaritalStatus[];
  religion?: string[];
  caste?: string[];
  education?: string[];
  occupation?: string[];
  country?: string[];
  state?: string[];
}

// Interest status
export type InterestStatus = 'pending' | 'accepted' | 'declined';

// Interest/Request document
export interface Interest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  status: InterestStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Match document
export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  interestId: string;
  status: 'active' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

// Notification types
export type NotificationType = 
  | 'new_interest'
  | 'interest_accepted'
  | 'interest_declined'
  | 'new_message'
  | 'profile_view';

// Notification document
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

// Message document
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

// Conversation
export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: Date;
}
