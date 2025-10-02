import { useMemo, useState } from 'react'
import { connectWallet as connectMassaWallet, requestMassaSnap, deposit as depositCall, withdraw as withdrawCall, createPlan as createPlanInvoke, subscribePlan, approvePull as approvePullInvoke, unsubscribe as unsubscribeInvoke, executePayment as execPaymentInvoke } from './lib/massa'
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { WalletSection } from "./components/WalletSection";
import { PaymentsSection } from "./components/PaymentsSection";
import { MerchantSection } from "./components/MerchantSection";
import { SubscriptionsSection } from "./components/SubscriptionsSection";

type Plan = { id: number; token: string; amount: string; periodSeconds: number; trialSeconds: number }

const ENV_ADDR = (import.meta as any).env?.VITE_SUBSCRIPTION_MANAGER || ''
const DEFAULT_ADDR = 'AS1m5E14BU77EwMHanRu9peGqq3uPuKNaDCUgXupcHjh8Zs39p14'
const CONTRACT_ADDRESS = ENV_ADDR || DEFAULT_ADDR

export default function App() {
  const [activeSection, setActiveSection] = useState<string>("payments");
  const [merchant, setMerchant] = useState('')
  const [token, setToken] = useState('')
  const [amount, setAmount] = useState('10')
  const [plans, setPlans] = useState<Plan[]>([])
  const [planId, setPlanId] = useState('1')
  const [subId, setSubId] = useState('1')
  const [account, setAccount] = useState<string>('')
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState(ENV_ADDR ? '' : `Using default contract: ${DEFAULT_ADDR}`)
  const [depAmt, setDepAmt] = useState('50')
  const [wdAmt, setWdAmt] = useState('10')
  const [pullAmt, setPullAmt] = useState('100')

  const monthlySec = useMemo(() => 30 * 86400, [])
  const trialSec = useMemo(() => 7 * 86400, [])

  async function connectWallet() {
    setConnecting(true)
    setError('')
    await requestMassaSnap()
    const res = await connectMassaWallet()
    setConnecting(false)
    if (!res.ok) return setError(res.error || 'Failed to connect wallet')
    setAccount(res.data!)
    setInfo(ENV_ADDR ? 'Wallet connected' : `Wallet connected · default contract set`)
    setTimeout(() => setInfo(''), 3000)
  }

  function createPlanLocal() {
    const id = plans.length + 1
    setPlans(p => [...p, { id, token, amount, periodSeconds: monthlySec, trialSeconds: trialSec }])
  }

  async function createPlanOnChain() {
    try {
      setError(''); setInfo('')
      const amt = (Number(amount) * 1e6).toFixed(0)
      const r = await createPlanInvoke(CONTRACT_ADDRESS, token, merchant || account, amt, trialSec)
      if (!(r as any).ok) throw new Error((r as any).error)
      setInfo('Plan created')
    } catch (e: any) { setError(e?.message || 'createPlan error') }
  }

  async function subscribeOnChain() {
    try {
      setError(''); setInfo('')
      const r = await subscribePlan(CONTRACT_ADDRESS, Number(planId))
      if (!(r as any).ok) throw new Error((r as any).error)
      setInfo('Subscribed')
    } catch (e: any) { setError(e?.message || 'subscribe error') }
  }

  async function approvePull() {
    try {
      setError(''); setInfo('')
      const amt = BigInt(Math.floor(Number(pullAmt) * 1e6)).toString()
      const r = await approvePullInvoke(CONTRACT_ADDRESS, amt)
      if (!(r as any).ok) throw new Error((r as any).error)
      setInfo('Pull allowance set')
    } catch (e: any) { setError(e?.message || 'approve error') }
  }

  async function unsubscribe() {
    try {
      setError(''); setInfo('')
      const r = await unsubscribeInvoke(CONTRACT_ADDRESS, Number(subId))
      if (!(r as any).ok) throw new Error((r as any).error)
      setInfo('Unsubscribed')
    } catch (e: any) { setError(e?.message || 'unsubscribe error') }
  }

  async function executePaymentNow() {
    try {
      setError(''); setInfo('')
      const r = await execPaymentInvoke(CONTRACT_ADDRESS, Number(subId))
      if (!(r as any).ok) throw new Error((r as any).error)
      setInfo('Payment executed (test)')
    } catch (e: any) { setError(e?.message || 'execute error') }
  }

  async function deposit() {
    try {
      setError(''); setInfo('')
      const amt = BigInt(Math.floor(Number(depAmt) * 1e6)).toString()
      const res = await depositCall({ contract: CONTRACT_ADDRESS, amount: amt })
      if (!res.ok) return setError(res.error || 'deposit failed')
      setInfo('Deposit submitted')
    } catch (e: any) { setError(e?.message || 'deposit error') }
  }

  async function withdraw() {
    try {
      setError(''); setInfo('')
      const amt = BigInt(Math.floor(Number(wdAmt) * 1e6)).toString()
      const res = await withdrawCall({ contract: CONTRACT_ADDRESS, amount: amt })
      if (!res.ok) return setError(res.error || 'withdraw failed')
      setInfo('Withdraw submitted')
    } catch (e: any) { setError(e?.message || 'withdraw error') }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
        contractAddress={CONTRACT_ADDRESS}
      />
      
      <div className="flex-1 flex flex-col relative">
        <Header />
        
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-8 py-8">
            <WalletSection 
              account={account}
              connecting={connecting}
              error={error}
              info={info}
              onConnectWallet={connectWallet}
              onRequestSnap={() => requestMassaSnap()}
            />
            
            {activeSection === "payments" && (
              <PaymentsSection 
                account={account}
                depAmt={depAmt}
                wdAmt={wdAmt}
                pullAmt={pullAmt}
                onDepAmtChange={setDepAmt}
                onWdAmtChange={setWdAmt}
                onPullAmtChange={setPullAmt}
                onDeposit={deposit}
                onWithdraw={withdraw}
                onApprovePull={approvePull}
              />
            )}
            
            {activeSection === "merchant" && (
              <MerchantSection 
                account={account}
                merchant={merchant}
                token={token}
                amount={amount}
                onMerchantChange={setMerchant}
                onTokenChange={setToken}
                onAmountChange={setAmount}
                onCreatePlanLocal={createPlanLocal}
                onCreatePlanOnChain={createPlanOnChain}
              />
            )}
            
            {activeSection === "subscriptions" && (
              <SubscriptionsSection 
                account={account}
                planId={planId}
                subId={subId}
                onPlanIdChange={setPlanId}
                onSubIdChange={setSubId}
                onSubscribe={subscribeOnChain}
                onUnsubscribe={unsubscribe}
                onExecutePayment={executePaymentNow}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
