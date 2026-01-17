import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Colors,
  FontSizes,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { signOut } from "../../services/authService";
import { RootStackParamList } from "../../navigation/types";

type ProfileScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch (e) {
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  const handleMenuPress = (title: string) => {
    if (title === "Edit Profile") navigation.navigate("EditProfile");
    else Alert.alert("Coming Soon", `${title} is under development`);
  };

  const menuItems = [
    {
      icon: "👤",
      title: "Edit Profile",
      subtitle: "Update your details and photos",
    },
    {
      icon: "💍",
      title: "Partner Preferences",
      subtitle: "Set your ideal match criteria",
    },
    {
      icon: "🔒",
      title: "Privacy Settings",
      subtitle: "Control who sees your profile",
    },
    {
      icon: "🔔",
      title: "Notifications",
      subtitle: "Manage notification preferences",
    },
    { icon: "✅", title: "Verification", subtitle: "Verify your profile" },
    { icon: "💎", title: "Premium", subtitle: "Upgrade for more features" },
    {
      icon: "❓",
      title: "Help & Support",
      subtitle: "Get help or report an issue",
    },
    { icon: "📄", title: "Terms & Privacy", subtitle: "Read our policies" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName?.[0] || user?.email?.[0] || "U"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Text style={styles.editAvatarIcon}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.displayName || "User"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <TouchableOpacity
            style={styles.completionCard}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <View style={styles.completionHeader}>
              <Text style={styles.completionTitle}>Profile Completion</Text>
              <Text style={styles.completionPercent}>60%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "60%" }]} />
            </View>
            <Text style={styles.completionHint}>
              Add more photos and details to get better matches
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Profile Views</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Interests</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
        </View>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.title)}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>{item.icon}</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  avatarContainer: { position: "relative", marginBottom: Spacing.lg },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight + "30",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarText: { fontSize: 40, fontWeight: "bold", color: Colors.primary },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  editAvatarIcon: { fontSize: 14 },
  userName: {
    fontSize: FontSizes.h2,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  completionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: "100%",
    ...Shadows.sm,
  },
  completionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  completionTitle: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  completionPercent: {
    fontSize: FontSizes.lg,
    fontWeight: "bold",
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray200,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  completionHint: { fontSize: FontSizes.sm, color: Colors.textLight },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: {
    fontSize: FontSizes.h2,
    fontWeight: "bold",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  menuContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Shadows.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconText: { fontSize: 18 },
  menuContent: { flex: 1, marginLeft: Spacing.md },
  menuTitle: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    marginTop: 2,
  },
  menuArrow: { fontSize: FontSizes.h2, color: Colors.textLight },
  signOutButton: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: "center",
  },
  signOutText: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.error,
  },
  version: {
    textAlign: "center",
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    marginVertical: Spacing.xl,
  },
});

export default ProfileScreen;
