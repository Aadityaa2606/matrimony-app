import prisma from "@/lib/db";

export async function blockedUserIds(userId: string): Promise<string[]> {
  const rows = await prisma.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
  });
  return rows.map((b) => (b.blockerId === userId ? b.blockedId : b.blockerId));
}
