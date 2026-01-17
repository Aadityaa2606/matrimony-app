import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
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
import { sendMessage, subscribeToMessages } from "../../services/matchService";
import { Message } from "../../types";
import { RootStackParamList } from "../../navigation/types";

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Chat">;
  route: RouteProp<RootStackParamList, "Chat">;
};

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { matchId, userName } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToMessages(user.uid, matchId, (newMessages) =>
      setMessages(newMessages),
    );
    return () => unsubscribe();
  }, [user, matchId]);

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;
    setIsSending(true);
    const messageText = inputText.trim();
    setInputText("");
    try {
      await sendMessage(user.uid, matchId, messageText);
    } catch (e) {
      console.error("Error sending message:", e);
      setInputText(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (date: Date | any): string => {
    if (!date) return "";
    const d = date instanceof Date ? date : date.toDate?.() || new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.senderId === user?.uid;
    return (
      <View
        style={[styles.messageContainer, isOwn && styles.ownMessageContainer]}
      >
        <View style={[styles.messageBubble, isOwn && styles.ownMessageBubble]}>
          <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isOwn && styles.ownMessageTime]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Text style={styles.avatarText}>{userName[0]}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{userName}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={styles.moreButton}>⋮</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>Start a conversation</Text>
              <Text style={styles.emptyText}>
                Send a message to begin chatting with {userName}
              </Text>
            </View>
          }
        />
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={Colors.gray400}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: "500",
  },
  headerInfo: { flexDirection: "row", alignItems: "center" },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight + "30",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: FontSizes.lg,
    fontWeight: "bold",
    color: Colors.primary,
  },
  headerName: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  headerStatus: { fontSize: FontSizes.sm, color: Colors.success },
  moreButton: { fontSize: FontSizes.h2, color: Colors.textSecondary },
  messagesList: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg },
  messageContainer: { flexDirection: "row", marginBottom: Spacing.md },
  ownMessageContainer: { justifyContent: "flex-end" },
  messageBubble: {
    maxWidth: "75%",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderBottomLeftRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.sm,
  },
  ownMessageBubble: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.sm,
  },
  messageText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  ownMessageText: { color: Colors.white },
  messageTime: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    marginTop: Spacing.xs,
    textAlign: "right",
  },
  ownMessageTime: { color: Colors.white, opacity: 0.7 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxxl * 3,
  },
  emptyIcon: { fontSize: 60, marginBottom: Spacing.lg },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: Spacing.xxxl,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: { backgroundColor: Colors.gray300 },
  sendButtonText: {
    fontSize: FontSizes.xl,
    color: Colors.white,
    fontWeight: "bold",
  },
});

export default ChatScreen;
