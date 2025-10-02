// Pseudocode contract for Massa ASC-enabled Subscription Manager
// Replace scheduleDeferredCall/now with Massa ASC primitives per docs:
// https://docs.massa.net/docs/build and repositories under https://github.com/massalabs

import type { IERC20, Address } from "./IERC20";

export type PlanId = number;
export type SubscriptionId = number;

export interface Plan {
  merchant: Address;
  token: Address;
  amount: string; // integer string in token smallest unit
  periodSeconds: number; // monthly for MVP: 30 * 86400
  trialSeconds: number; // e.g., 7 * 86400
  active: boolean;
}

export interface Subscription {
  subscriber: Address;
  planId: PlanId;
  nextPaymentTs: number;
  active: boolean;
  version: number; // increment on unsubscribe to invalidate stale deferred calls
}

export class SubscriptionManager {
  private plans: Map<PlanId, Plan> = new Map();
  private subscriptions: Map<SubscriptionId, Subscription> = new Map();
  private subsByUser: Map<Address, SubscriptionId[]> = new Map();
  private nextPlanId: number = 1;
  private nextSubId: number = 1;

  // Constants for MVP
  public static readonly MONTH_SECONDS = 30 * 86400;
  public static readonly DEFAULT_TRIAL_SECONDS = 7 * 86400;

  createPlan(merchant: Address, token: Address, amount: string, trialSeconds: number = SubscriptionManager.DEFAULT_TRIAL_SECONDS): PlanId {
    const plan: Plan = {
      merchant,
      token,
      amount,
      periodSeconds: SubscriptionManager.MONTH_SECONDS,
      trialSeconds,
      active: true,
    };
    const id = this.nextPlanId++;
    this.plans.set(id, plan);
    return id;
  }

  pausePlan(planId: PlanId): void {
    const plan = this.requirePlan(planId);
    plan.active = false;
  }

  resumePlan(planId: PlanId): void {
    const plan = this.requirePlan(planId);
    plan.active = true;
  }

  subscribe(caller: Address, planId: PlanId, nowTs: number): SubscriptionId {
    const plan = this.requirePlan(planId);
    if (!plan.active) throw new Error("plan_inactive");
    const nextTs = nowTs + (plan.trialSeconds > 0 ? plan.trialSeconds : 0);
    const sub: Subscription = {
      subscriber: caller,
      planId,
      nextPaymentTs: nextTs,
      active: true,
      version: 1,
    };
    const id = this.nextSubId++;
    this.subscriptions.set(id, sub);
    const arr = this.subsByUser.get(caller) ?? [];
    arr.push(id);
    this.subsByUser.set(caller, arr);

    // schedule ASC deferred call to executePayment(id) at nextTs
    // scheduleDeferredCall("executePayment", [id, sub.version], nextTs)
    return id;
  }

  unsubscribe(caller: Address, subId: SubscriptionId): void {
    const sub = this.requireSub(subId);
    if (sub.subscriber !== caller) throw new Error("unauthorized");
    sub.active = false;
    sub.version += 1; // invalidate scheduled calls
  }

  // Called by ASC deferred call
  async executePayment(subId: SubscriptionId, version: number, nowTs: number, tokenApi: (addr: Address) => IERC20): Promise<void> {
    const sub = this.subscriptions.get(subId);
    if (!sub) return;
    if (!sub.active) return;
    if (sub.version !== version) return; // stale

    const plan = this.requirePlan(sub.planId);
    if (!plan.active) return;

    const token = tokenApi(plan.token);
    const success = await token.transferFrom(sub.subscriber, plan.merchant, plan.amount);
    if (success) {
      sub.nextPaymentTs = nowTs + plan.periodSeconds;
      // schedule next ASC call
      // scheduleDeferredCall("executePayment", [subId, sub.version], sub.nextPaymentTs)
    } else {
      // backoff retry example: 6 hours then 24 hours then deactivate
      const retry1 = nowTs + 6 * 3600;
      // scheduleDeferredCall("retryPayment", [subId, sub.version, 1], retry1)
    }
  }

  // helpers
  getPlan(planId: PlanId): Plan | undefined { return this.plans.get(planId); }
  getSubscription(subId: SubscriptionId): Subscription | undefined { return this.subscriptions.get(subId); }
  getUserSubscriptions(user: Address): SubscriptionId[] { return this.subsByUser.get(user) ?? []; }

  private requirePlan(planId: PlanId): Plan {
    const p = this.plans.get(planId);
    if (!p) throw new Error("plan_not_found");
    return p;
  }
  private requireSub(subId: SubscriptionId): Subscription {
    const s = this.subscriptions.get(subId);
    if (!s) throw new Error("subscription_not_found");
    return s;
  }
}

