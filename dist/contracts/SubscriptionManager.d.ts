import type { IERC20, Address } from "./IERC20";
export type PlanId = number;
export type SubscriptionId = number;
export interface Plan {
    merchant: Address;
    token: Address;
    amount: string;
    periodSeconds: number;
    trialSeconds: number;
    active: boolean;
}
export interface Subscription {
    subscriber: Address;
    planId: PlanId;
    nextPaymentTs: number;
    active: boolean;
    version: number;
}
export declare class SubscriptionManager {
    private plans;
    private subscriptions;
    private subsByUser;
    private nextPlanId;
    private nextSubId;
    static readonly MONTH_SECONDS: number;
    static readonly DEFAULT_TRIAL_SECONDS: number;
    createPlan(merchant: Address, token: Address, amount: string, trialSeconds?: number): PlanId;
    pausePlan(planId: PlanId): void;
    resumePlan(planId: PlanId): void;
    subscribe(caller: Address, planId: PlanId, nowTs: number): SubscriptionId;
    unsubscribe(caller: Address, subId: SubscriptionId): void;
    executePayment(subId: SubscriptionId, version: number, nowTs: number, tokenApi: (addr: Address) => IERC20): Promise<void>;
    getPlan(planId: PlanId): Plan | undefined;
    getSubscription(subId: SubscriptionId): Subscription | undefined;
    getUserSubscriptions(user: Address): SubscriptionId[];
    private requirePlan;
    private requireSub;
}
