import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import {
  Colors,
  FontSizes,
  Spacing,
  BorderRadius,
  Shadows,
} from "../../constants/theme";

const profiles = [
  {
    id: "1",
    name: "Priya Sharma",
    age: 26,
    city: "Mumbai",
    occupation: "Software Engineer",
    religion: "Hindu",
  },
  {
    id: "2",
    name: "Ananya Patel",
    age: 24,
    city: "Delhi",
    occupation: "Doctor",
    religion: "Hindu",
  },
  {
    id: "3",
    name: "Sneha Reddy",
    age: 27,
    city: "Bangalore",
    occupation: "Designer",
    religion: "Hindu",
  },
  {
    id: "4",
    name: "Kavya Nair",
    age: 25,
    city: "Chennai",
    occupation: "Teacher",
    religion: "Hindu",
  },
  {
    id: "5",
    name: "Meera Singh",
    age: 28,
    city: "Hyderabad",
    occupation: "Manager",
    religion: "Hindu",
  },
];

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    ageMin: 21,
    ageMax: 35,
    religion: "",
  });

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.city.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderProfileCard = ({ item }: { item: (typeof profiles)[0] }) => (
    <TouchableOpacity style={styles.profileCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name[0]}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{item.name}</Text>
          <Text style={styles.profileDetails}>
            {item.age} yrs • {item.city}
          </Text>
          <Text style={styles.profileOccupation}>{item.occupation}</Text>
        </View>
      </View>
      <View style={styles.profileActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>❤️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
          <Text style={styles.sendInterest}>Send Interest</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>Find your perfect match</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, city..."
            placeholderTextColor={Colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activeFilters}>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>
            Age: {selectedFilters.ageMin}-{selectedFilters.ageMax}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>All Religions</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredProfiles.length} profiles found
        </Text>
      </View>

      <FlatList
        data={filteredProfiles}
        renderItem={renderProfileCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.profileList}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Age Range</Text>
              <View style={styles.ageInputs}>
                <TextInput
                  style={styles.ageInput}
                  placeholder="Min"
                  keyboardType="numeric"
                  value={String(selectedFilters.ageMin)}
                  onChangeText={(t) =>
                    setSelectedFilters({
                      ...selectedFilters,
                      ageMin: parseInt(t) || 18,
                    })
                  }
                />
                <Text style={styles.ageSeparator}>to</Text>
                <TextInput
                  style={styles.ageInput}
                  placeholder="Max"
                  keyboardType="numeric"
                  value={String(selectedFilters.ageMax)}
                  onChangeText={(t) =>
                    setSelectedFilters({
                      ...selectedFilters,
                      ageMax: parseInt(t) || 60,
                    })
                  }
                />
              </View>
            </View>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Religion</Text>
              <View style={styles.optionRow}>
                {["Any", "Hindu", "Muslim", "Christian", "Sikh"].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.optionChip,
                      selectedFilters.religion === r &&
                        styles.optionChipSelected,
                    ]}
                    onPress={() =>
                      setSelectedFilters({ ...selectedFilters, religion: r })
                    }
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        selectedFilters.religion === r &&
                          styles.optionChipTextSelected,
                      ]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.h1,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    ...Shadows.sm,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  filterIcon: { fontSize: 20 },
  activeFilters: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterChip: {
    backgroundColor: Colors.primaryLight + "20",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  filterChipText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: "500",
  },
  resultsHeader: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  resultsCount: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  profileList: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  cardHeader: { flexDirection: "row", marginBottom: Spacing.lg },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primaryLight + "30",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: FontSizes.h2,
    fontWeight: "bold",
    color: Colors.primary,
  },
  profileInfo: { flex: 1, marginLeft: Spacing.lg, justifyContent: "center" },
  profileName: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  profileDetails: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  profileOccupation: { fontSize: FontSizes.sm, color: Colors.textLight },
  profileActions: { flexDirection: "row", gap: Spacing.md },
  actionButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    alignItems: "center",
  },
  actionIcon: { fontSize: 18 },
  sendInterest: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: FontSizes.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: FontSizes.h2,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  closeButton: { fontSize: FontSizes.xl, color: Colors.textSecondary },
  filterSection: { marginBottom: Spacing.xl },
  filterLabel: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  ageInputs: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  ageInput: {
    flex: 1,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.lg,
    textAlign: "center",
  },
  ageSeparator: { fontSize: FontSizes.md, color: Colors.textSecondary },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  optionChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionChipText: { fontSize: FontSizes.md, color: Colors.textSecondary },
  optionChipTextSelected: { color: Colors.white },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: "600",
  },
});

export default SearchScreen;
