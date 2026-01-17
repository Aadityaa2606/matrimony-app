import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Colors,
  FontSizes,
  Spacing,
  BorderRadius,
} from "../../constants/theme";
import { AuthStackParamList } from "../../navigation/types";

const { width } = Dimensions.get("window");

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Welcome">;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>💑</Text>
          </View>
          <Text style={styles.title}>Find Your Perfect Match</Text>
          <Text style={styles.subtitle}>
            Join thousands of happy couples who found each other through our
            trusted matrimony platform
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>Verified Profiles</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>Privacy Protected</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>Smart Matching</Text>
          </View>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "space-between",
    paddingVertical: Spacing.xxxl,
  },
  header: {
    alignItems: "center",
    marginTop: Spacing.xxxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoText: {
    fontSize: 48,
  },
  title: {
    fontSize: FontSizes.h1,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  features: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginVertical: Spacing.xl,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.sm,
  },
  featureIcon: {
    fontSize: FontSizes.xl,
    color: Colors.success,
    marginRight: Spacing.md,
    fontWeight: "bold",
  },
  featureText: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
  },
  buttons: {
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: FontSizes.lg,
    fontWeight: "600",
  },
  footer: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    textAlign: "center",
    marginTop: Spacing.xl,
  },
});

export default WelcomeScreen;
