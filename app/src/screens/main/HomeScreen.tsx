import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import {
  Colors,
  FontSizes,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";

const featuredProfiles = [
  { id: "1", name: "Priya", age: 26, city: "Mumbai", image: null },
  { id: "2", name: "Ananya", age: 24, city: "Delhi", image: null },
  { id: "3", name: "Sneha", age: 27, city: "Bangalore", image: null },
];

const recentMatches = [
  { id: "1", name: "Rahul", age: 28, city: "Chennai", matchedOn: "2 days ago" },
  {
    id: "2",
    name: "Vikram",
    age: 30,
    city: "Hyderabad",
    matchedOn: "5 days ago",
  },
];

const HomeScreen: React.FC = () => {
  const { user } = useAuth();

  const renderProfileCard = ({
    item,
  }: {
    item: (typeof featuredProfiles)[0];
  }) => (
    <TouchableOpacity style={styles.profileCard}>
      <View style={styles.profileImage}>
        <Text style={styles.profileInitial}>{item.name[0]}</Text>
      </View>
      <Text style={styles.profileName}>
        {item.name}, {item.age}
      </Text>
      <Text style={styles.profileLocation}>{item.city}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>
              {user?.displayName || "User"} 👋
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Profile Views</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Interests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.ctaCard}>
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>Complete Your Profile</Text>
            <Text style={styles.ctaSubtitle}>
              Add more details to get better matches
            </Text>
          </View>
          <View style={styles.ctaProgress}>
            <Text style={styles.ctaProgressText}>60%</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={featuredProfiles}
            renderItem={renderProfileCard}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.profileList}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Matches</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentMatches.map((match) => (
            <TouchableOpacity key={match.id} style={styles.matchCard}>
              <View style={styles.matchAvatar}>
                <Text style={styles.matchInitial}>{match.name[0]}</Text>
              </View>
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>
                  {match.name}, {match.age}
                </Text>
                <Text style={styles.matchLocation}>{match.city}</Text>
              </View>
              <Text style={styles.matchDate}>{match.matchedOn}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  greeting: { fontSize: FontSizes.md, color: Colors.textSecondary },
  userName: {
    fontSize: FontSizes.h2,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.sm,
  },
  notificationIcon: { fontSize: 20 },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    ...Shadows.sm,
  },
  statNumber: {
    fontSize: FontSizes.h2,
    fontWeight: "bold",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  ctaCard: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  ctaContent: { flex: 1 },
  ctaTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  ctaSubtitle: { fontSize: FontSizes.sm, color: Colors.white, opacity: 0.8 },
  ctaProgress: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaProgressText: {
    fontSize: FontSizes.md,
    fontWeight: "bold",
    color: Colors.primary,
  },
  section: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  seeAll: { fontSize: FontSizes.md, color: Colors.primary, fontWeight: "500" },
  profileList: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  profileCard: {
    width: 140,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: "center",
    marginRight: Spacing.md,
    ...Shadows.md,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight + "30",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  profileInitial: {
    fontSize: FontSizes.h1,
    fontWeight: "bold",
    color: Colors.primary,
  },
  profileName: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  profileLocation: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  matchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  matchAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.secondary + "30",
    justifyContent: "center",
    alignItems: "center",
  },
  matchInitial: {
    fontSize: FontSizes.xl,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  matchInfo: { flex: 1, marginLeft: Spacing.md },
  matchName: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  matchLocation: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  matchDate: { fontSize: FontSizes.sm, color: Colors.textLight },
});

export default HomeScreen;
