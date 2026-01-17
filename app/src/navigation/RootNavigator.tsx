import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import { Colors } from "../constants/theme";
import { RootStackParamList } from "./types";

import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";

// Additional screens
import ProfileDetailScreen from "../screens/profile/ProfileDetailScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import ChatScreen from "../screens/main/ChatScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen
              name="ProfileDetail"
              component={ProfileDetailScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ animation: "slide_from_right" }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
});

export default RootNavigator;
