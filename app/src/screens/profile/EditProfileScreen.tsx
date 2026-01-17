import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Colors,
  FontSizes,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { getProfile, saveProfile } from "../../services/profileService";
import { Gender, MaritalStatus } from "../../types";
import { RootStackParamList } from "../../navigation/types";

type EditProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "EditProfile">;
};

const religions = [
  "Hindu",
  "Muslim",
  "Christian",
  "Sikh",
  "Jain",
  "Buddhist",
  "Other",
];
const maritalStatuses: { value: MaritalStatus; label: string }[] = [
  { value: "never_married", label: "Never Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "awaiting_divorce", label: "Awaiting Divorce" },
];

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "" as Gender | "",
    dateOfBirth: "",
    maritalStatus: "" as MaritalStatus | "",
    height: "",
    religion: "",
    motherTongue: "",
    education: "",
    occupation: "",
    annualIncome: "",
    country: "India",
    state: "",
    city: "",
    bio: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const profile = await getProfile(user.uid);
      if (profile) {
        setFormData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          gender: profile.gender || "",
          dateOfBirth: profile.dateOfBirth
            ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
            : "",
          maritalStatus: profile.maritalStatus || "",
          height: profile.height?.toString() || "",
          religion: profile.religion || "",
          motherTongue: profile.motherTongue || "",
          education: profile.education || "",
          occupation: profile.occupation || "",
          annualIncome: profile.annualIncome || "",
          country: profile.country || "India",
          state: profile.state || "",
          city: profile.city || "",
          bio: profile.bio || "",
        });
      }
    } catch (e) {
      console.error("Error loading profile:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    const required = [
      "firstName",
      "lastName",
      "gender",
      "dateOfBirth",
      "religion",
    ];
    const missing = required.filter(
      (f) => !formData[f as keyof typeof formData],
    );
    if (missing.length > 0) {
      Alert.alert("Required Fields", "Please fill in all required fields");
      return;
    }
    if (!user) return;

    setIsSaving(true);
    try {
      await saveProfile(user.uid, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender as Gender,
        dateOfBirth: new Date(formData.dateOfBirth),
        maritalStatus:
          (formData.maritalStatus as MaritalStatus) || "never_married",
        height: parseInt(formData.height) || 0,
        religion: formData.religion,
        motherTongue: formData.motherTongue,
        education: formData.education,
        occupation: formData.occupation,
        annualIncome: formData.annualIncome,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        bio: formData.bio,
      });
      Alert.alert("Success", "Profile saved successfully");
      navigation.goBack();
    } catch (e) {
      console.error("Error saving profile:", e);
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.saveButton}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(v) => updateField("firstName", v)}
                  placeholder="First name"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(v) => updateField("lastName", v)}
                  placeholder="Last name"
                />
              </View>
            </View>
            <Text style={styles.label}>Gender *</Text>
            <View style={styles.optionRow}>
              {(["male", "female"] as Gender[]).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.optionButton,
                    formData.gender === g && styles.optionButtonSelected,
                  ]}
                  onPress={() => updateField("gender", g)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.gender === g && styles.optionTextSelected,
                    ]}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Date of Birth *</Text>
            <TextInput
              style={styles.input}
              value={formData.dateOfBirth}
              onChangeText={(v) => updateField("dateOfBirth", v)}
              placeholder="YYYY-MM-DD"
            />
            <Text style={styles.label}>Marital Status</Text>
            <View style={styles.optionRow}>
              {maritalStatuses.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[
                    styles.optionButton,
                    formData.maritalStatus === s.value &&
                      styles.optionButtonSelected,
                  ]}
                  onPress={() => updateField("maritalStatus", s.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.maritalStatus === s.value &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={formData.height}
              onChangeText={(v) => updateField("height", v)}
              placeholder="e.g., 170"
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.sectionTitle}>Religious Background</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Religion *</Text>
            <View style={styles.optionRow}>
              {religions.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.optionButton,
                    formData.religion === r && styles.optionButtonSelected,
                  ]}
                  onPress={() => updateField("religion", r)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.religion === r && styles.optionTextSelected,
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Mother Tongue</Text>
            <TextInput
              style={styles.input}
              value={formData.motherTongue}
              onChangeText={(v) => updateField("motherTongue", v)}
              placeholder="e.g., Hindi, Tamil"
            />
          </View>
          <Text style={styles.sectionTitle}>Education & Career</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Education</Text>
            <TextInput
              style={styles.input}
              value={formData.education}
              onChangeText={(v) => updateField("education", v)}
              placeholder="e.g., B.Tech, MBA"
            />
            <Text style={styles.label}>Occupation</Text>
            <TextInput
              style={styles.input}
              value={formData.occupation}
              onChangeText={(v) => updateField("occupation", v)}
              placeholder="e.g., Software Engineer"
            />
            <Text style={styles.label}>Annual Income</Text>
            <TextInput
              style={styles.input}
              value={formData.annualIncome}
              onChangeText={(v) => updateField("annualIncome", v)}
              placeholder="e.g., 10-15 LPA"
            />
          </View>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              value={formData.country}
              onChangeText={(v) => updateField("country", v)}
              placeholder="Country"
            />
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  value={formData.state}
                  onChangeText={(v) => updateField("state", v)}
                  placeholder="State"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(v) => updateField("city", v)}
                  placeholder="City"
                />
              </View>
            </View>
          </View>
          <Text style={styles.sectionTitle}>About Me</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(v) => updateField("bio", v)}
              placeholder="Write about yourself..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backButton: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: "500",
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  saveButton: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: "600",
  },
  form: { flex: 1, paddingHorizontal: Spacing.xl },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  row: { flexDirection: "row", gap: Spacing.md },
  halfInput: { flex: 1 },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: "500",
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  textArea: { height: 100, paddingTop: Spacing.md },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  optionButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  optionTextSelected: { color: Colors.white, fontWeight: "500" },
  bottomPadding: { height: 40 },
});

export default EditProfileScreen;
