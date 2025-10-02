import { getWallets, type Wallet } from '@massalabs/wallet-provider'
import { Args } from '@massalabs/massa-web3'

export type CallResult<T = unknown> = { ok: boolean; data?: T; error?: string }

export async function requestMassaSnap(): Promise<void> {
	const eth = (window as any).ethereum
	if (!eth?.request) return
	try {
		console.debug('[snap] wallet_requestSnaps')
		await eth.request({
			method: 'wallet_requestSnaps',
			params: { 'npm:massalabs/metamask-snap': {} },
		})
	} catch (e) { console.debug('[snap] requestSnaps (ignored error)', e) }
	try {
		const snaps = await eth.request({ method: 'wallet_getSnaps' })
		console.debug('[snap] wallet_getSnaps', snaps)
	} catch (e) { console.debug('[snap] getSnaps error (ignored)', e) }
}

async function getMassaSnapId(): Promise<string> {
	const eth = (window as any).ethereum
	const snaps = await eth?.request?.({ method: 'wallet_getSnaps' })
	if (snaps) {
		const ids: string[] = Object.keys(snaps)
		const found = ids.find((id) => id.includes('massalabs'))
		if (found) return found
	}
	return 'npm:massalabs/metamask-snap'
}

function pickWallet(wallets: Wallet[]) {
	const byName = (n: string) => wallets.find(w => String(w.name?.()) === n)
	return byName('MassaStation') ?? byName('MetaMask (Massa Snap)') ?? wallets[0]
}

export async function connectWallet(): Promise<CallResult<string>> {
	try {
		await requestMassaSnap()
		const wallets = await getWallets()
		console.debug('[wallets]', wallets.map(w => String(w.name?.())))
		if (!wallets.length) return { ok: false, error: 'No Massa wallet detected' }
		const wallet = pickWallet(wallets)
		if (typeof (wallet as Wallet).connect === 'function') {
			const connected = await (wallet as Wallet).connect!()
			if (!connected) return { ok: false, error: 'Wallet connection rejected' }
		}
		const providers = await wallet.accounts()
		console.debug('[accounts]', providers?.map(p => p.address))
		if (!providers?.length) return { ok: false, error: 'No accounts in wallet' }
		const address = providers[0].address
		try { wallet.listenNetworkChanges?.((n) => console.debug('[network change]', n)) } catch {}
		try { wallet.listenAccountChanges?.((a) => console.debug('[account change]', a)) } catch {}
		return { ok: true, data: address }
	} catch (e: any) {
		console.error('[connectWallet] error', e)
		return { ok: false, error: e?.message || 'Wallet connect failed' }
	}
}

async function invoke(contract: string, functionName: string, a: Args) {
	const eth = (window as any).ethereum
	if (!eth?.request) throw new Error('MetaMask not available')
	await requestMassaSnap()
	const snapId = await getMassaSnapId()
	return eth.request({
		method: 'wallet_invokeSnap',
		params: { snapId, request: { method: 'account.callSC', params: { nickname: 'SubPay', fee: '100000000', functionName, at: contract, args: Array.from(a.serialize()), coins: '0' } } },
	})
}

export async function createPlan(contract: string, token: string, merchant: string, amount: string, trialSeconds: number) {
	try {
		const args = new Args().addString(token).addString(merchant).addString(amount).addString(String(trialSeconds))
		await invoke(contract, 'createPlan', args)
		return { ok: true }
	} catch (e: any) { return { ok: false, error: e?.message } }
}

export async function subscribePlan(contract: string, planId: number) {
	try {
		const args = new Args().addString(String(planId))
		await invoke(contract, 'subscribe', args)
		return { ok: true }
	} catch (e: any) { return { ok: false, error: e?.message } }
}

export async function executePayment(contract: string, subId: number) {
	try {
		const args = new Args().addString(String(subId))
		await invoke(contract, 'executePayment', args)
		return { ok: true }
	} catch (e: any) { return { ok: false, error: e?.message } }
}

export async function approvePull(contract: string, amount: string) {
	try {
		const args = new Args().addString(amount)
		await invoke(contract, 'approvePull', args)
		return { ok: true }
	} catch (e: any) { return { ok: false, error: e?.message } }
}

export async function unsubscribe(contract: string, subId: number) {
	try {
		const args = new Args().addString(String(subId))
		await invoke(contract, 'unsubscribe', args)
		return { ok: true }
	} catch (e: any) { return { ok: false, error: e?.message } }
}

export async function deposit(params: { contract: string; amount: string }): Promise<CallResult<{}>> {
	try {
		const args = new Args().addString(params.amount)
		await invoke(params.contract, 'deposit', args)
		return { ok: true, data: {} }
	} catch (e: any) { return { ok: false, error: e?.message || 'deposit failed' } }
}

export async function withdraw(params: { contract: string; amount: string }): Promise<CallResult<{}>> {
	try {
		const args = new Args().addString(params.amount)
		await invoke(params.contract, 'withdraw', args)
		return { ok: true, data: {} }
	} catch (e: any) { return { ok: false, error: e?.message || 'withdraw failed' } }
}
