// The entry file of your WebAssembly module.
import { Context, generateEvent, Storage, balance, deferredCallRegister, deferredCallCancel, deferredCallExists, deferredCallQuote, findCheapestSlot } from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';
import { Args, stringToBytes } from '@massalabs/as-types';

export const NAME_KEY = 'name_key';

/**
 * This function is meant to be called only one time: when the contract is deployed.
 *
 * @param binaryArgs - Arguments serialized with Args
 */
export function constructor(binaryArgs: StaticArray<u8>): void {
  // This line is important. It ensures that this function can't be called in the future.
  // If you remove this check, someone could call your constructor function and reset your smart contract.
  assert(Context.isDeployingContract());

  const argsDeser = new Args(binaryArgs);
  const name = argsDeser
    .nextString()
    .expect('Name argument is missing or invalid');

  Storage.set(NAME_KEY, name);
  generateEvent(`Constructor called with name ${name}`);
}

/**
 * @param _ - not used
 * @returns the emitted event serialized in bytes
 */
export function hello(_: StaticArray<u8>): StaticArray<u8> {
  assert(Storage.has(NAME_KEY), 'Name is not set');
  const name = Storage.get(NAME_KEY);
  const message = `Hello, ${name}!`;
  generateEvent(message);
  return stringToBytes(message);
}

// ---- Minimal escrow for deposit model (demo) ----
// NOTE: This demo models credits in storage (not actual MAS). For real MAS deposits,
// send coins with the call and credit Context.transferredCoins().

const ESCROW_PREFIX = 'escrow:'; // stores u64 as decimal string

function escrowKey(addr: string): string { return ESCROW_PREFIX + addr; }

export function deposit(binaryArgs: StaticArray<u8>): void {
  const caller = Context.caller().toString();
  const args = new Args(binaryArgs);
  const amountStr = args.nextString().expect('amount missing');
  assert(amountStr.length > 0, 'invalid amount');
  const key = escrowKey(caller);
  const prev = Storage.has(key) ? Storage.get(key) : '0';
  const prevU = U64.parseInt(prev);
  const amtU = U64.parseInt(amountStr);
  const next = (prevU + amtU).toString();
  Storage.set(key, next);
  generateEvent(`deposit ${caller} ${amountStr}`);
}

export function withdraw(binaryArgs: StaticArray<u8>): void {
  const caller = Context.caller().toString();
  const args = new Args(binaryArgs);
  const amountStr = args.nextString().expect('amount missing');
  assert(amountStr.length > 0, 'invalid amount');
  const key = escrowKey(caller);
  const prev = Storage.has(key) ? Storage.get(key) : '0';
  const prevU = U64.parseInt(prev);
  const amtU = U64.parseInt(amountStr);
  assert(prevU >= amtU, 'insufficient escrow');
  const next = (prevU - amtU).toString();
  Storage.set(key, next);
  generateEvent(`withdraw ${caller} ${amountStr}`);
}

// ---- Plans & Subscriptions (stubs with storage + events) ----
const PLAN_SEQ = 'plan_seq';
const SUB_SEQ = 'sub_seq';
const ALLOW_PREFIX = 'allow:'; // pull-model allowance per user

function nextId(key: string): u64 {
  const cur = Storage.has(key) ? Storage.get(key) : '0';
  const id = U64.parseInt(cur) + 1;
  Storage.set(key, id.toString());
  return id;
}

function planKey(id: u64, field: string): string { return 'plan:' + id.toString() + ':' + field; }
function subKey(id: u64, field: string): string { return 'sub:' + id.toString() + ':' + field; }
function allowKey(addr: string): string { return ALLOW_PREFIX + addr; }

function subCallKey(id: u64): string { return 'sub:' + id.toString() + ':call'; }

// Real scheduling using deferred calls
function scheduleNextPayment(subId: u64, _atTs: u64): void {
  // For simplicity, plan for the next period; converting timestamp to period length
  const maxGas = 20_000_000;
  const params = new Args().add(subId.toString()).serialize();
  const paramsSize: u32 = 0;
  const nextPeriod = Context.currentPeriod() + 1; // minimal next slot scheduling
  const slot = findCheapestSlot(nextPeriod, nextPeriod, maxGas, paramsSize);
  const _quote = deferredCallQuote(slot, maxGas, paramsSize);
  const before = balance();
  const callId = deferredCallRegister(
    Context.callee().toString(),
    'executePayment',
    slot,
    maxGas,
    params,
    0,
  );
  const booked = before - balance();
  Storage.set(subCallKey(subId), callId);
  generateEvent('scheduled ' + subId.toString() + ' cost ' + booked.toString());
}

// args: token(string), merchant(string), amount(string u64), trialSeconds(string u64)
export function createPlan(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const _token = args.nextString().expect('token missing');
  const merchant = args.nextString().expect('merchant missing');
  const amountStr = args.nextString().expect('amount missing');
  const trialStr = args.nextString().expect('trial missing');
  const id = nextId(PLAN_SEQ);
  Storage.set(planKey(id, 'merchant'), merchant);
  Storage.set(planKey(id, 'amount'), amountStr);
  Storage.set(planKey(id, 'trial'), trialStr);
  Storage.set(planKey(id, 'period'), (30 * 86400).toString());
  Storage.set(planKey(id, 'active'), '1');
  generateEvent('plan_created ' + id.toString());
}

// args: planId(string u64)
export function subscribe(binaryArgs: StaticArray<u8>): void {
  const caller = Context.caller().toString();
  const args = new Args(binaryArgs);
  const planIdStr = args.nextString().expect('planId missing');
  const id = nextId(SUB_SEQ);
  Storage.set(subKey(id, 'user'), caller);
  Storage.set(subKey(id, 'plan'), planIdStr);
  const now = Context.timestamp();
  const trial = Storage.get(planKey(U64.parseInt(planIdStr), 'trial'));
  const nextTs = (now + U64.parseInt(trial)).toString();
  Storage.set(subKey(id, 'next'), nextTs);
  Storage.set(subKey(id, 'active'), '1');
  Storage.set(subKey(id, 'ver'), '1');
  generateEvent('subscribed ' + id.toString());
  scheduleNextPayment(id, U64.parseInt(nextTs));
}

// args: subId(string u64)
export function executePayment(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const subIdStr = args.nextString().expect('subId missing');
  const subId = U64.parseInt(subIdStr);
  const active = Storage.has(subKey(subId, 'active')) ? Storage.get(subKey(subId, 'active')) : '0';
  if (active != '1') return;
  const user = Storage.get(subKey(subId, 'user'));
  const planIdStr = Storage.get(subKey(subId, 'plan'));
  const planId = U64.parseInt(planIdStr);
  const amount = U64.parseInt(Storage.get(planKey(planId, 'amount')));
  const period = U64.parseInt(Storage.get(planKey(planId, 'period')));

  // charge from escrow, else from pull allowance
  const balKey = escrowKey(user);
  const prev = Storage.has(balKey) ? Storage.get(balKey) : '0';
  const prevU = U64.parseInt(prev);
  if (prevU >= amount) {
    Storage.set(balKey, (prevU - amount).toString());
  } else {
    const aKey = allowKey(user);
    const aPrev = Storage.has(aKey) ? Storage.get(aKey) : '0';
    const aU = U64.parseInt(aPrev);
    if (aU < amount) {
      Storage.set(subKey(subId, 'active'), '0');
      generateEvent('payment_failed ' + subIdStr);
      return;
    }
    Storage.set(aKey, (aU - amount).toString());
  }
  const now = Context.timestamp();
  Storage.set(subKey(subId, 'next'), (now + period).toString());
  generateEvent('payment_ok ' + subIdStr);
  scheduleNextPayment(subId, now + period);
}

// args: amount(string u64)
export function approvePull(binaryArgs: StaticArray<u8>): void {
  const caller = Context.caller().toString();
  const args = new Args(binaryArgs);
  const amountStr = args.nextString().expect('amount missing');
  Storage.set(allowKey(caller), amountStr);
  generateEvent('approve_pull ' + caller + ' ' + amountStr);
}

// args: subId(string u64)
export function unsubscribe(binaryArgs: StaticArray<u8>): void {
  const caller = Context.caller().toString();
  const args = new Args(binaryArgs);
  const subIdStr = args.nextString().expect('subId missing');
  const subId = U64.parseInt(subIdStr);
  const user = Storage.get(subKey(subId, 'user'));
  assert(user == caller, 'not owner');
  Storage.set(subKey(subId, 'active'), '0');
  const cKey = subCallKey(subId);
  if (Storage.has(cKey)) {
    const id = Storage.get(cKey);
    if (deferredCallExists(id)) {
      deferredCallCancel(id);
      generateEvent('cancelled ' + id);
    }
  }
  generateEvent('unsubscribed ' + subIdStr);
}
