import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Matches: undefined;
  Profile: undefined;
};

// Root Stack (combines auth and main)
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProfileDetail: { profileId: string };
  EditProfile: undefined;
  Chat: { matchId: string; userName: string };
  Notifications: undefined;
};

// Navigation prop types
export type AuthStackNavigationProp<T extends keyof AuthStackParamList> =
  NativeStackNavigationProp<AuthStackParamList, T>;

export type MainTabNavigationProp<T extends keyof MainTabParamList> =
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, T>,
    NativeStackNavigationProp<RootStackParamList>
  >;

export type RootStackNavigationProp<T extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, T>;
