"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useChatClient } from "@/components/ChatProvider";
import { useT } from "@/components/LanguageProvider";
import type { Channel as ChannelType } from "stream-chat";

export default function ChatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useT();
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
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <span className="spinner w-8 h-8 border-primary" />
          <p className="text-base text-muted-foreground">{t("chat.loading")}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pt-2">
      <h1 className="font-serif text-2xl font-semibold text-primary">{t("chat.title")}</h1>
      <p className="mb-4 text-base text-muted-foreground">{t("chat.subtitle")}</p>
      {channels.length === 0 ? (
        <div className="card py-12 text-center">
          <h2 className="mb-2 font-serif text-xl text-primary">{t("chat.none.title")}</h2>
          <p className="mx-auto max-w-sm text-base text-muted-foreground">{t("chat.none.body")}</p>
        </div>
      ) : (
        <div className="space-y-3">
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
  const { t, lang } = useT();
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
      return d.toLocaleTimeString(lang === "ta" ? "ta-IN" : "en-IN", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return t("chat.yesterday");
    } else if (diffDays < 7) {
      return d.toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { weekday: "short" });
    } else {
      return d.toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { month: "short", day: "numeric" });
    }
  };

  return (
    <button
      onClick={onClick}
      className="flex min-h-16 w-full items-center gap-3 rounded-[18px] border border-border bg-white p-3 text-left shadow-sm"
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
            {(otherUser?.name as string) || t("chat.unknown")}
          </h3>
          <span className="text-xs text-muted-foreground shrink-0 ml-2">
            {formatTime(lastMessage?.created_at)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="truncate text-base text-muted-foreground">
            {lastMessage?.type === "deleted" ? t("chat.removedByAdmin") : lastMessage?.text || t("chat.noMessages")}
          </p>
          {unreadCount > 0 && (
            <span className="shrink-0 ml-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
