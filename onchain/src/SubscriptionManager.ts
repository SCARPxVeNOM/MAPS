// SubscriptionManager smart contract (skeleton) for massa-sc-toolkit
// Replace comments with actual toolkit imports and primitives to schedule deferred calls.

export namespace SubscriptionManagerSc {
	export type Address = string
	export type PlanId = number
	export type SubId = number

	export interface Plan { merchant: Address; token: Address; amount: bigint; periodSeconds: number; trialSeconds: number; active: boolean }
	export interface Sub { subscriber: Address; planId: PlanId; nextPaymentTs: number; active: boolean; version: number }

	// storage (pseudo). With toolkit, use storage API (e.g., key-value / collections)
	const plans = new Map<PlanId, Plan>()
	const subs = new Map<SubId, Sub>()
	const escrow = new Map<Address, bigint>() // user -> deposited MAS (or tokenless credits) for deposit model
	let nextPlanId: PlanId = 1
	let nextSubId: SubId = 1

	export function createPlan(merchant: Address, token: Address, amount: bigint, trialSeconds: number): PlanId {
		const id = nextPlanId++
		plans.set(id, { merchant, token, amount, periodSeconds: 30 * 86400, trialSeconds, active: true })
		return id
	}

	export function pausePlan(id: PlanId): void {
		const p = plans.get(id)
		if (!p) return
		p.active = false
		plans.set(id, p)
	}

	export function resumePlan(id: PlanId): void {
		const p = plans.get(id)
		if (!p) return
		p.active = true
		plans.set(id, p)
	}

	export function subscribe(caller: Address, planId: PlanId, nowTs: number): SubId {
		const p = plans.get(planId)
		if (!p || !p.active) throw new Error('plan_inactive')
		const nextTs = nowTs + p.trialSeconds
		const id = nextSubId++
		subs.set(id, { subscriber: caller, planId, nextPaymentTs: nextTs, active: true, version: 1 })
		// scheduleDeferredCall('executePayment', [id, 1], nextTs)
		return id
	}

	export function unsubscribe(caller: Address, subId: SubId): void {
		const s = subs.get(subId)
		if (!s) return
		if (s.subscriber !== caller) throw new Error('unauthorized')
		s.active = false
		s.version = s.version + 1
		subs.set(subId, s)
	}

	// --- Deposit model ---
	// Users deposit funds (MAS or credits) to be used for future payments. In a real contract,
	// this would transfer MAS into the contract balance. Here we model it as internal credits.
	export function deposit(caller: Address, amount: bigint): void {
		if (amount <= 0n) throw new Error('invalid_amount')
		const prev = escrow.get(caller) ?? 0n
		escrow.set(caller, prev + amount)
	}

	export function withdraw(caller: Address, amount: bigint): void {
		if (amount <= 0n) throw new Error('invalid_amount')
		const prev = escrow.get(caller) ?? 0n
		if (prev < amount) throw new Error('insufficient_escrow')
		escrow.set(caller, prev - amount)
		// In real contract: transfer MAS back to caller
	}

	// executePayment will be invoked by the deferred scheduler
	export function executePayment(subId: SubId, version: number, nowTs: number): void {
		const s = subs.get(subId)
		if (!s) return
		if (!s.active) return
		if (s.version !== version) return
		const p = plans.get(s.planId)
		if (!p || !p.active) return
		// Deposit model: pay from escrow balance
		const bal = escrow.get(s.subscriber) ?? 0n
		if (bal >= p.amount) {
			// deduct and "credit" merchant (omitted: transfer)
			escrow.set(s.subscriber, bal - p.amount)
			// schedule next
			s.nextPaymentTs = nowTs + p.periodSeconds
			subs.set(subId, s)
			// scheduleDeferredCall('executePayment', [subId, version], s.nextPaymentTs)
		} else {
			// insufficient deposit: deactivate or retry with backoff
			// Example policy: deactivate
			s.active = false
			subs.set(subId, s)
		}
	}
}
