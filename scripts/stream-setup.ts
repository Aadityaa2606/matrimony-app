process.loadEnvFile(".env");
import { streamServer } from "../lib/stream";

// Allowlist: clients may only read, mark-read, mute and flag. All writes go through our server.
const ALLOWED = ["read-channel", "read-channel-members", "mute-channel", "flag-message"];
const ROLES = ["user", "channel_member"];

async function main() {
  const c = streamServer();
  const ct = await c.getChannelType("messaging");
  const grants = { ...(ct.grants as Record<string, string[]>) };
  console.log("before:", JSON.stringify(Object.fromEntries(ROLES.map((r) => [r, grants[r]]))));
  for (const r of ROLES) grants[r] = (grants[r] ?? []).filter((p) => ALLOWED.some((a) => p === a || p === `${a}-owner`));
  await c.updateChannelType("messaging", { grants });
  const after = (await c.getChannelType("messaging")).grants as Record<string, string[]>;
  console.log("after:", JSON.stringify(Object.fromEntries(ROLES.map((r) => [r, after[r]]))));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
