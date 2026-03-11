"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useChatClient } from "@/components/ChatProvider";
import type { Channel as ChannelType } from "stream-chat";

export default function ChatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { client, isReady } = useChatClient();
  const [channels, setChannels] = useState<ChannelType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  useEffect(() => {
    if (!isReady || !client || !session?.user?.id) return;
    const userId = session.user.id;

    const loadChannels = async () => {
      try {
        const filter = {
          type: "messaging" as const,
          members: { $in: [userId] },
        };
        const sort = [{ last_message_at: -1 as const }];
        const result = await client.queryChannels(filter, sort, {
          watch: true,
          state: true,
          limit: 30,
        });
        setChannels(result);
      } catch (error) {
        console.error("Error loading channels:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChannels();

    // Listen for new channels
    const handleEvent = () => {
      loadChannels();
    };
    client.on("notification.message_new", handleEvent);
    client.on("notification.added_to_channel", handleEvent);

    return () => {
      client.off("notification.message_new", handleEvent);
      client.off("notification.added_to_channel", handleEvent);
    };
  }, [isReady, client, session?.user?.id]);

  if (status === "loading" || !isReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="spinner w-8 h-8 border-primary" />
          <p className="text-sm text-muted-foreground">
            Loading conversations...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-serif font-semibold">Messages</h1>
          <p className="text-white/80 text-sm mt-1">
            Connect with your matches
          </p>
        </div>
      </header>

      {/* Channel List */}
      <main className="p-4 max-w-2xl mx-auto mt-4">
        {channels.length === 0 ? (
          <div className="card text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 bg-(--accent)/20 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-accent"
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
            <h2 className="heading-primary text-2xl text-primary mb-3">
              No Conversations Yet
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Visit a profile and tap &quot;Message&quot; to start a
              conversation with your match!
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {channels.map((channel) => (
              <ChannelPreview
                key={channel.cid}
                channel={channel}
                currentUserId={session.user!.id!}
                onClick={() => router.push(`/chats/${channel.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ChannelPreview({
  channel,
  currentUserId,
  onClick,
}: {
  channel: ChannelType;
  currentUserId: string;
  onClick: () => void;
}) {
  const members = Object.values(channel.state.members);
  const otherMember = members.find((m) => m.user_id !== currentUserId);
  const otherUser = otherMember?.user;
  const lastMessage = channel.state.messages[channel.state.messages.length - 1];
  const unreadCount = channel.countUnread();

  const formatTime = (date: string | Date | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return d.toLocaleDateString([], { weekday: "short" });
    } else {
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 text-left"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {otherUser?.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={otherUser.image as string}
            alt={otherUser.name as string}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-border"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xl font-serif">
            {(otherUser?.name as string)?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        {otherUser?.online && (
          <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-foreground truncate">
            {(otherUser?.name as string) || "Unknown User"}
          </h3>
          <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0 ml-2">
            {formatTime(lastMessage?.created_at)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted-foreground)] truncate">
            {lastMessage?.text || "No messages yet"}
          </p>
          {unreadCount > 0 && (
            <span className="flex-shrink-0 ml-2 w-5 h-5 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
