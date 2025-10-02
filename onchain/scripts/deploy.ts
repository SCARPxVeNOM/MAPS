import 'dotenv/config'

async function main() {
	const deployedAddress = process.env.SUBSCRIPTION_MANAGER_ADDRESS || 'AS_DEPLOYED_ADDRESS'
	console.log(JSON.stringify({ deployedAddress }, null, 2))
}

main().catch((e) => { console.error(e); process.exit(1) })
