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
  const { client, isReady, failed } = useChatClient();
  const [channels, setChannels] = useState<ChannelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

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
        setLoadFailed(false);
      } catch (error) {
        console.error("Error loading channels:", error);
        setLoadFailed(true);
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

  if (failed || (loadFailed && channels.length === 0)) {
    return (
      <main className="mx-auto max-w-2xl px-4 pt-2">
        <div role="alert" className="card py-10 text-center">
          <p className="mb-4 text-base text-error">{t("err.generic")}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">{t("common.retry")}</button>
        </div>
      </main>
    );
  }

  if (status === "loading" || !isReady || loading) {
    return (
      <main aria-busy="true" aria-label={t("chat.loading")} className="mx-auto max-w-2xl px-4 pt-2">
        <div className="skeleton mb-2 h-7 w-32" />
        <div className="skeleton mb-5 h-4 w-56" />
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-[18px] border border-border bg-white p-3">
              <div className="skeleton h-14 w-14 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </main>
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
      className="animate-fade-in flex min-h-16 w-full items-center gap-3 rounded-[18px] border border-border bg-white p-3 text-left shadow-sm transition hover:border-accent hover:shadow-md active:scale-[.99]"
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
          <h3 className={`truncate text-foreground ${unreadCount > 0 ? "font-bold" : "font-semibold"}`}>
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
            <span className="ml-2 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
