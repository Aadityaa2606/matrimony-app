import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Profile, PartnerPreferences } from '../types';

const PROFILES_COLLECTION = 'profiles';

// Create or update a profile
export const saveProfile = async (
  userId: string,
  profileData: Partial<Profile>
): Promise<void> => {
  const profileRef = doc(db, PROFILES_COLLECTION, userId);
  const existingProfile = await getDoc(profileRef);

  if (existingProfile.exists()) {
    await updateDoc(profileRef, {
      ...profileData,
      updatedAt: new Date(),
    });
  } else {
    await setDoc(profileRef, {
      ...profileData,
      userId,
      photos: [],
      isVisible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
};

// Get a profile by user ID
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const profileRef = doc(db, PROFILES_COLLECTION, userId);
  const profileSnap = await getDoc(profileRef);

  if (profileSnap.exists()) {
    return { id: profileSnap.id, ...profileSnap.data() } as Profile;
  }

  return null;
};

// Get a profile by profile ID
export const getProfileById = async (profileId: string): Promise<Profile | null> => {
  const profileRef = doc(db, PROFILES_COLLECTION, profileId);
  const profileSnap = await getDoc(profileRef);

  if (profileSnap.exists()) {
    return { id: profileSnap.id, ...profileSnap.data() } as Profile;
  }

  return null;
};

// Search profiles with filters
export interface ProfileSearchFilters {
  gender?: 'male' | 'female';
  ageMin?: number;
  ageMax?: number;
  religion?: string;
  city?: string;
  maritalStatus?: string;
}

export const searchProfiles = async (
  filters: ProfileSearchFilters,
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<{ profiles: Profile[]; lastDoc: DocumentSnapshot | null }> => {
  let q = query(
    collection(db, PROFILES_COLLECTION),
    where('isVisible', '==', true),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (filters.gender) {
    q = query(q, where('gender', '==', filters.gender));
  }

  if (filters.religion) {
    q = query(q, where('religion', '==', filters.religion));
  }

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const profiles = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Profile[];

  // Client-side age filtering (since Firestore can't do date-based age calculations)
  const filteredProfiles = profiles.filter((profile) => {
    if (filters.ageMin || filters.ageMax) {
      const birthDate = profile.dateOfBirth instanceof Date 
        ? profile.dateOfBirth 
        : new Date(profile.dateOfBirth);
      const age = calculateAge(birthDate);
      
      if (filters.ageMin && age < filters.ageMin) return false;
      if (filters.ageMax && age > filters.ageMax) return false;
    }

    if (filters.city && profile.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }

    return true;
  });

  const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

  return { profiles: filteredProfiles, lastDoc: lastVisible };
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  
  return age;
};

// Upload profile photo
export const uploadProfilePhoto = async (
  userId: string,
  imageUri: string,
  fileName: string
): Promise<string> => {
  const response = await fetch(imageUri);
  const blob = await response.blob();
  
  const photoRef = ref(storage, `users/${userId}/photos/${fileName}`);
  await uploadBytes(photoRef, blob);
  
  const downloadUrl = await getDownloadURL(photoRef);
  return downloadUrl;
};

// Delete profile photo
export const deleteProfilePhoto = async (
  userId: string,
  photoUrl: string
): Promise<void> => {
  // Extract file name from URL
  const fileName = photoUrl.split('/').pop()?.split('?')[0];
  if (!fileName) return;

  const photoRef = ref(storage, `users/${userId}/photos/${fileName}`);
  await deleteObject(photoRef);
};

// Update profile photos array
export const updateProfilePhotos = async (
  userId: string,
  photos: string[]
): Promise<void> => {
  const profileRef = doc(db, PROFILES_COLLECTION, userId);
  await updateDoc(profileRef, {
    photos,
    updatedAt: new Date(),
  });
};

// Update partner preferences
export const updatePartnerPreferences = async (
  userId: string,
  preferences: PartnerPreferences
): Promise<void> => {
  const profileRef = doc(db, PROFILES_COLLECTION, userId);
  await updateDoc(profileRef, {
    partnerPreferences: preferences,
    updatedAt: new Date(),
  });
};

// Toggle profile visibility
export const toggleProfileVisibility = async (
  userId: string,
  isVisible: boolean
): Promise<void> => {
  const profileRef = doc(db, PROFILES_COLLECTION, userId);
  await updateDoc(profileRef, {
    isVisible,
    updatedAt: new Date(),
  });
};

// Delete profile
export const deleteProfile = async (userId: string): Promise<void> => {
  const profileRef = doc(db, PROFILES_COLLECTION, userId);
  await deleteDoc(profileRef);
};

// Get recommended profiles based on partner preferences
export const getRecommendedProfiles = async (
  userId: string,
  pageSize: number = 10
): Promise<Profile[]> => {
  const userProfile = await getProfile(userId);
  if (!userProfile) return [];

  // Get profiles of opposite gender
  const targetGender = userProfile.gender === 'male' ? 'female' : 'male';

  const q = query(
    collection(db, PROFILES_COLLECTION),
    where('isVisible', '==', true),
    where('gender', '==', targetGender),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  const snapshot = await getDocs(q);
  const profiles = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Profile)
    .filter((profile) => profile.userId !== userId);

  return profiles;
};
