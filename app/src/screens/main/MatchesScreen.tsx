import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
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

type TabType = "received" | "sent" | "matches";

const receivedInterests = [
  {
    id: "1",
    name: "Rahul Kumar",
    age: 28,
    city: "Mumbai",
    occupation: "Engineer",
    date: "2 hours ago",
  },
  {
    id: "2",
    name: "Amit Singh",
    age: 30,
    city: "Delhi",
    occupation: "Doctor",
    date: "1 day ago",
  },
  {
    id: "3",
    name: "Vikram Patel",
    age: 27,
    city: "Bangalore",
    occupation: "Manager",
    date: "2 days ago",
  },
];

const sentInterests = [
  {
    id: "1",
    name: "Priya Sharma",
    age: 26,
    city: "Chennai",
    status: "pending",
    date: "3 hours ago",
  },
  {
    id: "2",
    name: "Sneha Reddy",
    age: 25,
    city: "Hyderabad",
    status: "accepted",
    date: "1 day ago",
  },
];

const matches = [
  {
    id: "1",
    name: "Sneha Reddy",
    age: 25,
    city: "Hyderabad",
    matchedOn: "1 day ago",
    hasUnread: true,
  },
  {
    id: "2",
    name: "Kavya Nair",
    age: 24,
    city: "Kochi",
    matchedOn: "3 days ago",
    hasUnread: false,
  },
];

const MatchesScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("received");

  const renderReceivedCard = ({
    item,
  }: {
    item: (typeof receivedInterests)[0];
  }) => (
    <View style={styles.interestCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name[0]}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardDetails}>
            {item.age} yrs • {item.city}
          </Text>
          <Text style={styles.cardOccupation}>{item.occupation}</Text>
        </View>
        <Text style={styles.cardDate}>{item.date}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.declineButton}>
          <Text style={styles.declineText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton}>
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSentCard = ({ item }: { item: (typeof sentInterests)[0] }) => (
    <View style={styles.interestCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name[0]}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardDetails}>
            {item.age} yrs • {item.city}
          </Text>
          <View
            style={[
              styles.statusBadge,
              item.status === "accepted"
                ? styles.statusAccepted
                : styles.statusPending,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "accepted"
                  ? styles.statusTextAccepted
                  : styles.statusTextPending,
              ]}
            >
              {item.status === "accepted" ? "✓ Accepted" : "⏳ Pending"}
            </Text>
          </View>
        </View>
        <Text style={styles.cardDate}>{item.date}</Text>
      </View>
    </View>
  );

  const renderMatchCard = ({ item }: { item: (typeof matches)[0] }) => (
    <TouchableOpacity style={styles.matchCard}>
      <View style={styles.matchAvatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name[0]}</Text>
        </View>
        {item.hasUnread && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardDetails}>
          {item.age} yrs • {item.city}
        </Text>
        <Text style={styles.matchedOn}>Matched {item.matchedOn}</Text>
      </View>
      <TouchableOpacity style={styles.chatButton}>
        <Text style={styles.chatIcon}>💬</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "received":
        return (
          <FlatList
            data={receivedInterests}
            renderItem={renderReceivedCard}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💌</Text>
                <Text style={styles.emptyTitle}>No interests yet</Text>
              </View>
            }
          />
        );
      case "sent":
        return (
          <FlatList
            data={sentInterests}
            renderItem={renderSentCard}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📤</Text>
                <Text style={styles.emptyTitle}>No sent interests</Text>
              </View>
            }
          />
        );
      case "matches":
        return (
          <FlatList
            data={matches}
            renderItem={renderMatchCard}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💑</Text>
                <Text style={styles.emptyTitle}>No matches yet</Text>
              </View>
            }
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.subtitle}>
          Manage your interests and connections
        </Text>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "received" && styles.activeTab]}
          onPress={() => setActiveTab("received")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "received" && styles.activeTabText,
            ]}
          >
            Received
          </Text>
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{receivedInterests.length}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "sent" && styles.activeTab]}
          onPress={() => setActiveTab("sent")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "sent" && styles.activeTabText,
            ]}
          >
            Sent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "matches" && styles.activeTab]}
          onPress={() => setActiveTab("matches")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "matches" && styles.activeTabText,
            ]}
          >
            Matches
          </Text>
          {matches.some((m) => m.hasUnread) && <View style={styles.tabDot} />}
        </TouchableOpacity>
      </View>
      {renderContent()}
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
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    gap: Spacing.xs,
  },
  activeTab: { backgroundColor: Colors.primary },
  tabText: {
    fontSize: FontSizes.md,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  activeTabText: { color: Colors.white },
  tabBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    alignItems: "center",
  },
  tabBadgeText: {
    fontSize: FontSizes.xs,
    color: Colors.white,
    fontWeight: "bold",
  },
  tabDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  listContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  interestCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start" },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight + "30",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: FontSizes.h3,
    fontWeight: "bold",
    color: Colors.primary,
  },
  cardInfo: { flex: 1, marginLeft: Spacing.md },
  cardName: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardDetails: { fontSize: FontSizes.md, color: Colors.textSecondary },
  cardOccupation: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  cardDate: { fontSize: FontSizes.sm, color: Colors.textLight },
  cardActions: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.lg },
  declineButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: "center",
  },
  declineText: {
    color: Colors.error,
    fontWeight: "600",
    fontSize: FontSizes.md,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.success,
    alignItems: "center",
  },
  acceptText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: FontSizes.md,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  statusPending: { backgroundColor: Colors.warning + "20" },
  statusAccepted: { backgroundColor: Colors.success + "20" },
  statusText: { fontSize: FontSizes.sm, fontWeight: "500" },
  statusTextPending: { color: Colors.warning },
  statusTextAccepted: { color: Colors.success },
  matchCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.md,
  },
  matchAvatarContainer: { position: "relative" },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.error,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  matchedOn: {
    fontSize: FontSizes.sm,
    color: Colors.success,
    marginTop: Spacing.xs,
  },
  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  chatIcon: { fontSize: 20 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxxl * 2,
  },
  emptyIcon: { fontSize: 60, marginBottom: Spacing.lg },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
});

export default MatchesScreen;
