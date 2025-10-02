import { SubscriptionManager } from "../contracts/SubscriptionManager";

async function main() {
  const planId = Number(process.argv[2] || 1);
  const subscriber = process.argv[3] || "AS_USER_ADDRESS";
  const nowTs = Math.floor(Date.now() / 1000);

  const manager = new SubscriptionManager();
  const subId = manager.subscribe(subscriber, planId, nowTs);
  console.log(JSON.stringify({ subId }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

