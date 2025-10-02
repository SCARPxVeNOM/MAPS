import { SubscriptionManager } from "../contracts/SubscriptionManager";

async function main() {
  const subId = Number(process.argv[2] || 1);
  const caller = process.argv[3] || "AS_USER_ADDRESS";

  const manager = new SubscriptionManager();
  manager.unsubscribe(caller, subId);
  console.log(JSON.stringify({ unsubscribed: subId }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

