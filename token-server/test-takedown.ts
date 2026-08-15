import { AuthFetch } from '@bsv/sdk'
import { Setup } from '@bsv/wallet-toolbox'

const STORAGE_URL = process.env.STORAGE_URL || 'https://uhrp.equusv.com'
const UHRP_URL_TO_TAKE_DOWN = 'XUUaxNuL6s7NQ5YpdJNqptj7R9vX89Fz8FPqUCEVh2wDTzgckTLr'

async function main() {
	const wallet = await Setup.createWalletClientNoEnv({
		chain: 'main',
		rootKeyHex: process.env.EQUUSV_ROOT_KEY as string
	})

	console.log('Testar takedown som identityKey:', wallet.identityKey)

	const authFetch = new AuthFetch(wallet)

	const response = await authFetch.fetch(`${STORAGE_URL}/admin/takedown`, {
    	method: 'POST',
    	headers: { 'Content-Type': 'application/json' },	
		body: JSON.stringify({ uhrpUrl: UHRP_URL_TO_TAKE_DOWN })
  })			

 	const body = await response.json()
	console.log('Status:', response.status)
	console.log('Svar:', JSON.stringify(body, null, 2))
}

main().catch(err => {
  console.error('Testet kraschade:', err)
  process.exit(1)
})

