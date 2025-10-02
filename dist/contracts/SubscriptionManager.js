"use strict";
// Pseudocode contract for Massa ASC-enabled Subscription Manager
// Replace scheduleDeferredCall/now with Massa ASC primitives per docs:
// https://docs.massa.net/docs/build and repositories under https://github.com/massalabs
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionManager = void 0;
class SubscriptionManager {
    constructor() {
        this.plans = new Map();
        this.subscriptions = new Map();
        this.subsByUser = new Map();
        this.nextPlanId = 1;
        this.nextSubId = 1;
    }
    createPlan(merchant, token, amount, trialSeconds = SubscriptionManager.DEFAULT_TRIAL_SECONDS) {
        const plan = {
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
    pausePlan(planId) {
        const plan = this.requirePlan(planId);
        plan.active = false;
    }
    resumePlan(planId) {
        const plan = this.requirePlan(planId);
        plan.active = true;
    }
    subscribe(caller, planId, nowTs) {
        const plan = this.requirePlan(planId);
        if (!plan.active)
            throw new Error("plan_inactive");
        const nextTs = nowTs + (plan.trialSeconds > 0 ? plan.trialSeconds : 0);
        const sub = {
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
    unsubscribe(caller, subId) {
        const sub = this.requireSub(subId);
        if (sub.subscriber !== caller)
            throw new Error("unauthorized");
        sub.active = false;
        sub.version += 1; // invalidate scheduled calls
    }
    // Called by ASC deferred call
    async executePayment(subId, version, nowTs, tokenApi) {
        const sub = this.subscriptions.get(subId);
        if (!sub)
            return;
        if (!sub.active)
            return;
        if (sub.version !== version)
            return; // stale
        const plan = this.requirePlan(sub.planId);
        if (!plan.active)
            return;
        const token = tokenApi(plan.token);
        const success = await token.transferFrom(sub.subscriber, plan.merchant, plan.amount);
        if (success) {
            sub.nextPaymentTs = nowTs + plan.periodSeconds;
            // schedule next ASC call
            // scheduleDeferredCall("executePayment", [subId, sub.version], sub.nextPaymentTs)
        }
        else {
            // backoff retry example: 6 hours then 24 hours then deactivate
            const retry1 = nowTs + 6 * 3600;
            // scheduleDeferredCall("retryPayment", [subId, sub.version, 1], retry1)
        }
    }
    // helpers
    getPlan(planId) { return this.plans.get(planId); }
    getSubscription(subId) { return this.subscriptions.get(subId); }
    getUserSubscriptions(user) { return this.subsByUser.get(user) ?? []; }
    requirePlan(planId) {
        const p = this.plans.get(planId);
        if (!p)
            throw new Error("plan_not_found");
        return p;
    }
    requireSub(subId) {
        const s = this.subscriptions.get(subId);
        if (!s)
            throw new Error("subscription_not_found");
        return s;
    }
}
exports.SubscriptionManager = SubscriptionManager;
// Constants for MVP
SubscriptionManager.MONTH_SECONDS = 30 * 86400;
SubscriptionManager.DEFAULT_TRIAL_SECONDS = 7 * 86400;
