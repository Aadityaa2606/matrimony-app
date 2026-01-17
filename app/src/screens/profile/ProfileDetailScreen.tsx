import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import {
  Colors,
  FontSizes,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { getProfileById, calculateAge } from "../../services/profileService";
import {
  sendInterest,
  getExistingInterest,
} from "../../services/interestService";
import { Profile } from "../../types";
import { RootStackParamList } from "../../navigation/types";

type ProfileDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ProfileDetail">;
  route: RouteProp<RootStackParamList, "ProfileDetail">;
};

const DetailRow: React.FC<{ label: string; value?: string }> = ({
  label,
  value,
}) => {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
};

const ProfileDetailScreen: React.FC<ProfileDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { profileId } = route.params;
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [interestSent, setInterestSent] = useState(false);

  useEffect(() => {
    loadProfile();
    checkExistingInterest();
  }, [profileId]);

  const loadProfile = async () => {
    try {
      const data = await getProfileById(profileId);
      setProfile(data);
    } catch (e) {
      console.error("Error loading profile:", e);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingInterest = async () => {
    if (!user) return;
    try {
      const existing = await getExistingInterest(user.uid, profileId);
      if (existing) setInterestSent(true);
    } catch (e) {
      console.error("Error checking interest:", e);
    }
  };

  const handleSendInterest = async () => {
    if (!user || !profile) return;
    setIsSending(true);
    try {
      await sendInterest(user.uid, profile.userId);
      setInterestSent(true);
      Alert.alert("Success", "Interest sent successfully!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to send interest");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  if (!profile)
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Profile not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );

  const age = profile.dateOfBirth
    ? calculateAge(new Date(profile.dateOfBirth))
    : null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.moreButton}>⋮</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <View style={styles.photoPlaceholder}>
            <Text style={styles.placeholderText}>
              {profile.firstName?.[0] || "?"}
            </Text>
          </View>
        </View>
        <View style={styles.infoCard}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {profile.firstName} {profile.lastName}
            </Text>
            {profile.isVisible && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>
          <Text style={styles.basicInfo}>
            {age ? `${age} years` : ""} • {profile.city}, {profile.state}
          </Text>
          <Text style={styles.occupation}>{profile.occupation}</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Height</Text>
            <Text style={styles.statValue}>
              {profile.height ? `${profile.height} cm` : "-"}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Religion</Text>
            <Text style={styles.statValue}>{profile.religion || "-"}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={styles.statValue}>
              {profile.maritalStatus?.replace("_", " ") || "-"}
            </Text>
          </View>
        </View>
        {profile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Details</Text>
          <View style={styles.detailsCard}>
            <DetailRow label="Education" value={profile.education} />
            <DetailRow label="Occupation" value={profile.occupation} />
            <DetailRow label="Income" value={profile.annualIncome} />
            <DetailRow label="Mother Tongue" value={profile.motherTongue} />
            <DetailRow
              label="Location"
              value={`${profile.city}, ${profile.state}`}
            />
          </View>
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>💬 Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, interestSent && styles.disabledButton]}
          onPress={handleSendInterest}
          disabled={interestSent || isSending}
        >
          {isSending ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>
              {interestSent ? "✓ Interest Sent" : "❤️ Send Interest"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  backLink: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backButton: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: "500",
  },
  moreButton: { fontSize: FontSizes.h2, color: Colors.textSecondary },
  photoSection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  photoPlaceholder: {
    width: "100%",
    height: 350,
    borderRadius: BorderRadius.xxl,
    backgroundColor: Colors.primaryLight + "30",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { fontSize: 80, fontWeight: "bold", color: Colors.primary },
  infoCard: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  nameRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  name: {
    fontSize: FontSizes.h2,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.info,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedText: { color: Colors.white, fontSize: 12, fontWeight: "bold" },
  basicInfo: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  occupation: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  statItem: { flex: 1, alignItems: "center" },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  bioText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailLabel: { fontSize: FontSizes.md, color: Colors.textLight },
  detailValue: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  bottomPadding: { height: 100 },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: FontSizes.md,
    fontWeight: "600",
  },
  primaryButton: {
    flex: 2,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  disabledButton: { backgroundColor: Colors.success },
  primaryButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: "600",
  },
});

export default ProfileDetailScreen;
