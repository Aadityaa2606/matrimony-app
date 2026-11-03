import { StreamChat } from "stream-chat";

export function streamServer(): StreamChat {
  return StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!, process.env.STREAM_API_SECRET!);
}
