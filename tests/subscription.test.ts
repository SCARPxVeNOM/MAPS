import { SubscriptionManager } from "../contracts/SubscriptionManager";
import type { IERC20 } from "../contracts/IERC20";

class MockToken implements IERC20 {
  private balances = new Map<string, bigint>();
  async name() { return "MockUSD"; }
  async symbol() { return "MUSD"; }
  async decimals() { return 6; }
  async balanceOf(a: string) { return (this.balances.get(a) ?? 0n).toString(); }
  async allowance() { return (10n ** 18n).toString(); }
  async approve() { return true; }
  async transfer() { return true; }
  async transferFrom(sender: string, recipient: string, amount: string) {
    const amt = BigInt(amount);
    const sBal = this.balances.get(sender) ?? 0n;
    if (sBal < amt) return false;
    this.balances.set(sender, sBal - amt);
    const rBal = this.balances.get(recipient) ?? 0n;
    this.balances.set(recipient, rBal + amt);
    return true;
  }
  fund(addr: string, amount: bigint) { this.balances.set(addr, amount); }
}

function tokenApi(t: MockToken) {
  return (_addr: string) => t;
}

async function run() {
  const manager = new SubscriptionManager();
  const token = new MockToken();
  const user = "USER";
  const merchant = "MERCHANT";
  token.fund(user, 100n * 10n ** 6n);
  const planId = manager.createPlan(merchant, "TOKEN", (10n * 10n ** 6n).toString(), 7 * 86400);
  const now = 1_700_000_000;
  const subId = manager.subscribe(user, planId, now);
  const sub = manager.getSubscription(subId)!;
  if (sub.nextPaymentTs !== now + 7 * 86400) throw new Error("trial not applied");

  // simulate first execution after trial
  const at = sub.nextPaymentTs;
  await manager.executePayment(subId, sub.version, at, tokenApi(token));
  const sub2 = manager.getSubscription(subId)!;
  if (sub2.nextPaymentTs <= at) throw new Error("next payment not scheduled");
  const merchBal = await token.balanceOf(merchant);
  if (merchBal !== (10n * 10n ** 6n).toString()) throw new Error("merchant not paid");

  console.log("ok");
}

run().catch((e) => { console.error(e); process.exit(1); });

