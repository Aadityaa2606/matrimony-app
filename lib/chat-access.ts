import prisma from "@/lib/db";
import { activeMemberWhere } from "@/lib/member";
import { channelMembers, type SendBlock } from "@/lib/chat-rules";

/** null = caller is not in this channel. Otherwise the other user and the first blocking reason, if any. */
export async function chatAccess(
  myId: string,
  channelId: string,
): Promise<{ otherId: string; block: Exclude<SendBlock, "await_reply"> | null; iBlocked: boolean } | null> {
  const pair = channelMembers(channelId);
  if (!pair || !pair.includes(myId)) return null;
  const otherId = pair[0] === myId ? pair[1] : pair[0];
  const [mine, theirs, other] = await Promise.all([
    prisma.block.findUnique({ where: { blockerId_blockedId: { blockerId: myId, blockedId: otherId } } }),
    prisma.block.findUnique({ where: { blockerId_blockedId: { blockerId: otherId, blockedId: myId } } }),
    prisma.user.findFirst({ where: { id: otherId, ...activeMemberWhere(new Date()) }, select: { id: true } }),
  ]);
  const block = mine ? "blocked_by_you" : theirs ? "blocked_you" : !other ? "other_inactive" : null;
  return { otherId, block, iBlocked: !!mine };
}
