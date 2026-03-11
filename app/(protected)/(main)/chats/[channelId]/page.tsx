"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useChatClient } from "@/components/ChatProvider";
import type {
  Channel as ChannelType,
  MessageResponse,
  Event,
} from "stream-chat";

interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userImage?: string;
  createdAt: Date;
  isMine: boolean;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { client, isReady } = useChatClient();
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<{
    name: string;
    image?: string;
    online?: boolean;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const channelId = params.channelId as string;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const formatMessage = useCallback(
    (msg: MessageResponse, currentUserId: string): ChatMessage => ({
      id: msg.id,
      text: msg.text || "",
      userId: msg.user?.id || "",
      userName: (msg.user?.name as string) || "Unknown",
      userImage: msg.user?.image as string | undefined,
      createdAt: new Date(msg.created_at as string),
      isMine: msg.user?.id === currentUserId,
    }),
    [],
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  useEffect(() => {
    if (!isReady || !client || !session?.user?.id || !channelId) return;
    const currentUserId = session.user.id;

    let activeChannel: ChannelType | null = null;

    const initChannel = async () => {
      try {
        const ch = client.channel("messaging", channelId);
        await ch.watch();
        activeChannel = ch;
        setChannel(ch);

        // Get other user info
        const members = Object.values(ch.state.members);
        const other = members.find((m) => m.user_id !== currentUserId);
        if (other?.user) {
          setOtherUser({
            name: other.user.name as string,
            image: other.user.image as string | undefined,
            online: other.user.online,
          });
        }

        // Load messages
        const formattedMessages = ch.state.messages.map((msg) =>
          formatMessage(msg as unknown as MessageResponse, currentUserId),
        );
        setMessages(formattedMessages);

        // Mark as read
        await ch.markRead();
      } catch (error) {
        console.error("Error loading channel:", error);
        router.push("/chats");
      } finally {
        setLoading(false);
      }
    };

    initChannel();

    return () => {
      if (activeChannel) {
        activeChannel.stopWatching();
      }
    };
  }, [isReady, client, session?.user?.id, channelId, router, formatMessage]);

  // Listen for new messages
  useEffect(() => {
    if (!channel || !session?.user?.id) return;
    const msgUserId = session.user.id;

    const handleNewMessage = (event: Event) => {
      if (event.message) {
        const formatted = formatMessage(
          event.message as unknown as MessageResponse,
          msgUserId,
        );
        setMessages((prev) => [...prev, formatted]);
        channel.markRead();
      }
    };

    channel.on("message.new", handleNewMessage);

    return () => {
      channel.off("message.new", handleNewMessage);
    };
  }, [channel, session?.user?.id, formatMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Anti-spam: count consecutive trailing messages from current user
  const MAX_UNANSWERED = 2;
  const consecutiveOwnMessages = (() => {
    let count = 0;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].isMine) count++;
      else break;
    }
    return count;
  })();
  const isBlocked = consecutiveOwnMessages >= MAX_UNANSWERED;

  const handleSend = async () => {
    if (!newMessage.trim() || !channel || sending || isBlocked) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      await channel.sendMessage({ text: messageText });
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (status === "loading" || !isReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="spinner w-8 h-8 border-primary" />
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!session || !channel) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background z-50">
      {/* Chat Header */}
      <header className="bg-gradient-hero text-white p-4 shadow-lg flex items-center gap-3 shrink-0">
        <button
          onClick={() => router.push("/chats")}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            {otherUser?.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={otherUser.image}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-serif">
                {otherUser?.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            {otherUser?.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-primary-dark" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold truncate">
              {otherUser?.name || "Chat"}
            </h2>
            <p className="text-xs text-white/70">
              {otherUser?.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
            <div className="w-16 h-16 rounded-full bg-(--accent)/20 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm">
              Say hello to {otherUser?.name || "your match"}! 👋
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const showAvatar =
              !msg.isMine && (index === 0 || messages[index - 1]?.isMine);

            return (
              <div
                key={msg.id}
                className={`flex ${msg.isMine ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`flex items-end gap-2 max-w-[80%] ${msg.isMine ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar for other user */}
                  {!msg.isMine && (
                    <div className="shrink-0 w-7">
                      {showAvatar ? (
                        msg.userImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={msg.userImage}
                            alt={msg.userName}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-serif">
                            {msg.userName[0]?.toUpperCase()}
                          </div>
                        )
                      ) : null}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      msg.isMine
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-white text-foreground rounded-bl-md shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                      {msg.text}
                    </p>
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.isMine ? "text-white/60" : "text-muted-foreground"
                      }`}
                    >
                      {msg.createdAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="shrink-0 bg-white border-t border-border p-3 pb-safe">
        {isBlocked ? (
          <div className="max-w-2xl mx-auto text-center py-2">
            <p className="text-sm text-muted-foreground">
              ⏳ Waiting for{" "}
              <span className="font-semibold">{otherUser?.name || "them"}</span>{" "}
              to reply before you can send more messages
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)/30 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark disabled:opacity-40 transition-all disabled:cursor-not-allowed"
            >
              {sending ? (
                <span className="spinner w-4 h-4" />
              ) : (
                <svg
                  className="w-5 h-5 rotate-90"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
