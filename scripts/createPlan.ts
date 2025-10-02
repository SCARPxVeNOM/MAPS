import { SubscriptionManager } from "../contracts/SubscriptionManager";

async function main() {
  const token = process.argv[2] || "AS_TOKEN_ADDRESS";
  const merchant = process.argv[3] || "AS_MERCHANT_ADDRESS";
  const amount = process.argv[4] || (10n * 10n ** 6n).toString();
  const trialDays = Number(process.argv[5] || 7);

  const manager = new SubscriptionManager();
  const planId = manager.createPlan(merchant, token, amount, trialDays * 86400);
  console.log(JSON.stringify({ planId }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

