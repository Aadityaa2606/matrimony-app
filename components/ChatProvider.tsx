"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import { StreamChat } from "stream-chat";

interface ChatContextType {
  client: StreamChat | null;
  isReady: boolean;
}

const ChatContext = createContext<ChatContextType>({
  client: null,
  isReady: false,
});

export const useChatClient = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [client, setClient] = useState<StreamChat | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    let chatClient: StreamChat | null = null;
    let didCancel = false;

    const initChat = async () => {
      try {
        const res = await fetch("/api/chat/token");
        const data = await res.json();

        if (!res.ok || didCancel) return;

        chatClient = StreamChat.getInstance(
          process.env.NEXT_PUBLIC_STREAM_API_KEY!,
        );

        await chatClient.connectUser(
          {
            id: data.userId,
            name: data.userName,
            image: data.userImage || undefined,
          },
          data.token,
        );

        if (!didCancel) {
          setClient(chatClient);
          setIsReady(true);
        }
      } catch (error) {
        console.error("Failed to initialize Stream Chat:", error);
      }
    };

    initChat();

    return () => {
      didCancel = true;
      if (chatClient) {
        chatClient.disconnectUser().then(() => {
          setClient(null);
          setIsReady(false);
        });
      }
    };
  }, [session?.user?.id, status]);

  return (
    <ChatContext.Provider value={{ client, isReady }}>
      {children}
    </ChatContext.Provider>
  );
}
