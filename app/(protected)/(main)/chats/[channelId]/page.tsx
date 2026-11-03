"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useChatClient } from "@/components/ChatProvider";
import { LangToggle } from "@/components/LangToggle";
import { useT } from "@/components/LanguageProvider";
import type { DictKey } from "@/lib/i18n/dict";
import type { Channel as ChannelType, MessageResponse, Event } from "stream-chat";

interface ChatMessage {
  id: string;
  text: string;
  deleted: boolean;
  userId: string;
  userName: string;
  userImage?: string;
  createdAt: Date;
  isMine: boolean;
}

interface ChatState {
  canSend: boolean;
  reason: string | null;
  otherUserId: string;
  iBlocked: boolean;
}

const NOTICES = ["await_reply", "blocked_you", "blocked_by_you", "other_inactive", "inactive"];

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { t, lang } = useT();
  const { client, isReady } = useChatClient();
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [blockError, setBlockError] = useState(false);
  const [chatState, setChatState] = useState<ChatState | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [otherUser, setOtherUser] = useState<{ name: string; image?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);

  const channelId = params.channelId as string;

  const refreshState = useCallback(async () => {
    try {
      const r = await fetch(`/api/chat/state?channelId=${encodeURIComponent(channelId)}`);
      if (r.ok) setChatState(await r.json());
    } catch {
      /* keep previous state */
    }
  }, [channelId]);

  const formatMessage = useCallback(
    (msg: MessageResponse, currentUserId: string): ChatMessage => ({
      id: msg.id,
      text: msg.text || "",
      deleted: msg.type === "deleted",
      userId: msg.user?.id || "",
      userName: (msg.user?.name as string) || "?",
      userImage: msg.user?.image as string | undefined,
      createdAt: new Date(msg.created_at as string),
      isMine: msg.user?.id === currentUserId,
    }),
    [],
  );

  useEffect(() => {
    if (status === "unauthenticated") router.push("/sign-in");
  }, [status, router]);

  useEffect(() => {
    if (!isReady || !client || !session?.user?.id || !channelId) return;
    const currentUserId = session.user.id;
    let activeChannel: ChannelType | null = null;

    (async () => {
      try {
        const ch = client.channel("messaging", channelId);
        await ch.watch();
        activeChannel = ch;
        setChannel(ch);
        const other = Object.values(ch.state.members).find((m) => m.user_id !== currentUserId);
        if (other?.user) {
          setOtherUser({ name: other.user.name as string, image: other.user.image as string | undefined });
        }
        setMessages(
          ch.state.messages.map((m) => formatMessage(m as unknown as MessageResponse, currentUserId)),
        );
        await ch.markRead();
        refreshState();
      } catch (e) {
        console.error("Error loading channel:", e);
        router.push("/chats");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      activeChannel?.stopWatching();
    };
  }, [isReady, client, session?.user?.id, channelId, router, formatMessage, refreshState]);

  // Live updates. Our own sends arrive here too (server sends on our behalf).
  useEffect(() => {
    if (!channel || !session?.user?.id) return;
    const uid = session.user.id;
    const onNew = (event: Event) => {
      if (!event.message) return;
      const f = formatMessage(event.message as unknown as MessageResponse, uid);
      setMessages((prev) => (prev.some((m) => m.id === f.id) ? prev : [...prev, f]));
      channel.markRead();
      refreshState();
    };
    const onDeleted = (event: Event) => {
      if (!event.message) return;
      const f = formatMessage(event.message as unknown as MessageResponse, uid);
      setMessages((prev) => prev.map((m) => (m.id === f.id ? f : m)));
    };
    channel.on("message.new", onNew);
    channel.on("message.deleted", onDeleted);
    channel.on("message.updated", onDeleted);
    return () => {
      channel.off("message.new", onNew);
      channel.off("message.deleted", onDeleted);
      channel.off("message.updated", onDeleted);
    };
  }, [channel, session?.user?.id, formatMessage, refreshState]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const post = () =>
    fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId, text: newMessage.trim() }),
    });

  const handleSend = async () => {
    if (!newMessage.trim() || inFlight.current) return;
    inFlight.current = true; // ref guards double-tap before state re-renders
    setSending(true);
    setError(false);
    try {
      let res = await post();
      if (res.status === 409) res = await post(); // one automatic retry
      if (res.ok) setNewMessage("");
      else setError(true);
    } catch {
      setError(true);
    } finally {
      inFlight.current = false;
      setSending(false);
      refreshState();
    }
  };

  const setBlock = async (method: "POST" | "DELETE") => {
    if (!chatState) return;
    setBlockError(false);
    try {
      const res = await fetch("/api/blocks", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: chatState.otherUserId }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setConfirmBlock(false);
      refreshState();
    } catch {
      setBlockError(true); // dialog stays open so the user can retry
    }
  };

  if (status === "loading" || !isReady || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="spinner w-8 h-8 border-primary" />
      </div>
    );
  }
  if (!session || !channel) return null;

  const name = otherUser?.name || t("chat.unknown");
  const time = (d: Date) =>
    d.toLocaleTimeString(lang === "ta" ? "ta-IN" : "en-IN", { hour: "2-digit", minute: "2-digit" });
  const reason = chatState?.reason;
  const notice = reason && NOTICES.includes(reason) ? t(`chat.${reason}` as DictKey) : null;

  return (
    <div className="fixed inset-x-0 bottom-16 top-0 z-40 flex flex-col bg-background">
      <header className="flex shrink-0 items-center gap-2 border-b border-border bg-white px-2 py-2">
        <button
          onClick={() => router.push("/chats")}
          aria-label={t("chat.back")}
          className="flex h-12 w-12 items-center justify-center rounded-full text-primary"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {otherUser?.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={otherUser.image} alt="" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-serif text-white">
            {name[0]?.toUpperCase()}
          </div>
        )}
        <h2 className="min-w-0 flex-1 truncate text-lg font-semibold">{name}</h2>
        <LangToggle />
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={t("chat.menu")}
            className="flex h-12 w-12 items-center justify-center rounded-full text-primary"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-12 z-10 w-56 rounded-[14px] border border-border bg-white py-1 shadow-lg">
              {chatState && !chatState.iBlocked && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmBlock(true);
                  }}
                  className="min-h-12 w-full px-4 text-left text-base text-error"
                >
                  {t("chat.block")}
                </button>
              )}
              {chatState?.iBlocked && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setBlock("DELETE");
                  }}
                  className="min-h-12 w-full px-4 text-left text-base"
                >
                  {t("settings.unblock")}
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-3 py-3">
        {messages.length === 0 ? (
          <p className="py-16 text-center text-base text-muted-foreground">{t("chat.hello", { name })}</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-[18px] px-4 py-2 ${
                  msg.deleted
                    ? "border border-border bg-muted text-muted-foreground"
                    : msg.isMine
                      ? "rounded-br-md bg-primary text-white"
                      : "rounded-bl-md border border-border bg-white text-foreground"
                }`}
              >
                <p className={`whitespace-pre-wrap break-words text-base leading-relaxed ${msg.deleted ? "italic" : ""}`}>
                  {msg.deleted ? t("chat.removedByAdmin") : msg.text}
                </p>
                <p className={`mt-0.5 text-xs ${msg.isMine && !msg.deleted ? "text-white/70" : "text-muted-foreground"}`}>
                  {time(msg.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-border bg-white p-3">
        {blockError && !confirmBlock && <p className="mb-2 text-center text-base text-error">{t("err.generic")}</p>}
        {chatState && !chatState.canSend ? (
          <div className="flex flex-col items-center gap-2 py-1 text-center">
            <p className="text-base text-muted-foreground">{notice ?? t("err.generic")}</p>
            {reason === "blocked_by_you" && (
              <button className="btn btn-primary" onClick={() => setBlock("DELETE")}>
                {t("settings.unblock")}
              </button>
            )}
          </div>
        ) : (
          <>
            {error && <p className="mb-2 text-base text-error">{t("err.generic")}</p>}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t("chat.placeholder")}
                className="min-h-12 min-w-0 flex-1 rounded-full border border-border bg-input px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                aria-label={t("chat.send")}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
              >
                {sending ? (
                  <span className="spinner w-4 h-4" />
                ) : (
                  <svg className="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {confirmBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div role="dialog" className="w-full max-w-sm rounded-[18px] bg-white p-5">
            <h3 className="mb-2 font-serif text-xl text-primary">{t("chat.block.title", { name })}</h3>
            <p className="mb-4 text-base text-muted-foreground">{t("chat.block.body")}</p>
            {blockError && <p className="mb-3 text-base text-error">{t("err.generic")}</p>}
            <div className="flex gap-3">
              <button className="btn flex-1 border border-border" onClick={() => {
                  setConfirmBlock(false);
                  setBlockError(false);
                }}>
                {t("chat.cancel")}
              </button>
              <button className="btn btn-primary flex-1" onClick={() => setBlock("POST")}>
                {t("chat.block.yes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
