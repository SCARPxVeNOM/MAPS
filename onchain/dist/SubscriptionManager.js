// SubscriptionManager smart contract (skeleton) for massa-sc-toolkit
// Replace comments with actual toolkit imports and primitives to schedule deferred calls.
export var SubscriptionManagerSc;
(function (SubscriptionManagerSc) {
    // storage (pseudo). With toolkit, use storage API (e.g., key-value / collections)
    const plans = new Map();
    const subs = new Map();
    let nextPlanId = 1;
    let nextSubId = 1;
    function createPlan(merchant, token, amount, trialSeconds) {
        const id = nextPlanId++;
        plans.set(id, { merchant, token, amount, periodSeconds: 30 * 86400, trialSeconds, active: true });
        return id;
    }
    SubscriptionManagerSc.createPlan = createPlan;
    function pausePlan(id) {
        const p = plans.get(id);
        if (!p)
            return;
        p.active = false;
        plans.set(id, p);
    }
    SubscriptionManagerSc.pausePlan = pausePlan;
    function resumePlan(id) {
        const p = plans.get(id);
        if (!p)
            return;
        p.active = true;
        plans.set(id, p);
    }
    SubscriptionManagerSc.resumePlan = resumePlan;
    function subscribe(caller, planId, nowTs) {
        const p = plans.get(planId);
        if (!p || !p.active)
            throw new Error('plan_inactive');
        const nextTs = nowTs + p.trialSeconds;
        const id = nextSubId++;
        subs.set(id, { subscriber: caller, planId, nextPaymentTs: nextTs, active: true, version: 1 });
        // scheduleDeferredCall('executePayment', [id, 1], nextTs)
        return id;
    }
    SubscriptionManagerSc.subscribe = subscribe;
    function unsubscribe(caller, subId) {
        const s = subs.get(subId);
        if (!s)
            return;
        if (s.subscriber !== caller)
            throw new Error('unauthorized');
        s.active = false;
        s.version = s.version + 1;
        subs.set(subId, s);
    }
    SubscriptionManagerSc.unsubscribe = unsubscribe;
    // executePayment will be invoked by the deferred scheduler
    function executePayment(subId, version, nowTs) {
        const s = subs.get(subId);
        if (!s)
            return;
        if (!s.active)
            return;
        if (s.version !== version)
            return;
        const p = plans.get(s.planId);
        if (!p || !p.active)
            return;
        // call token.transferFrom(s.subscriber, p.merchant, p.amount) via token standard
        // if success:
        s.nextPaymentTs = nowTs + p.periodSeconds;
        subs.set(subId, s);
        // scheduleDeferredCall('executePayment', [subId, version], s.nextPaymentTs)
        // else: schedule retry or deactivate
    }
    SubscriptionManagerSc.executePayment = executePayment;
})(SubscriptionManagerSc || (SubscriptionManagerSc = {}));
