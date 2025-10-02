"use strict";
// Placeholder deploy script. Replace with massa-sc-toolkit deployment when wiring to chain.
// See massalabs repos: https://github.com/massalabs and docs: https://docs.massa.net/docs/build
Object.defineProperty(exports, "__esModule", { value: true });
const SubscriptionManager_1 = require("../contracts/SubscriptionManager");
async function main() {
    const manager = new SubscriptionManager_1.SubscriptionManager();
    // Example: create a plan for USDC-like token
    const tokenAddress = process.env.SUB_TOKEN_ADDRESS || "AS_TOKEN_ADDRESS";
    const merchant = process.env.MERCHANT_ADDRESS || "AS_MERCHANT_ADDRESS";
    const amount = (10n * 10n ** 6n).toString(); // 10 USDC with 6 decimals
    const planId = manager.createPlan(merchant, tokenAddress, amount);
    console.log(JSON.stringify({ planId }, null, 2));
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
