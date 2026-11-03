process.loadEnvFile(".env");
import { streamServer } from "../lib/stream";

const BLOCKED = ["create-message", "update-message", "upload-attachment", "create-reaction", "create-reply", "schedule-message", "create-channel", "update-channel", "truncate-channel", "delete-channel", "recreate-channel"];
const ROLES = ["user", "channel_member"];

async function main() {
  const c = streamServer();
  const ct = await c.getChannelType("messaging");
  const grants = { ...(ct.grants as Record<string, string[]>) };
  console.log("before:", JSON.stringify(Object.fromEntries(ROLES.map((r) => [r, grants[r]]))));
  for (const r of ROLES) grants[r] = (grants[r] ?? []).filter((p) => !BLOCKED.some((b) => p.startsWith(b)));
  await c.updateChannelType("messaging", { grants });
  const after = (await c.getChannelType("messaging")).grants as Record<string, string[]>;
  console.log("after:", JSON.stringify(Object.fromEntries(ROLES.map((r) => [r, after[r]]))));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
