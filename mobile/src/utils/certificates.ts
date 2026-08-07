/**
 * Publishes an identity certificate to the tm_identity overlay so others can
 * find it via resolveByIdentityKey (discovery). Only reveals the fields in
 * fieldsToReveal. The mobile builds the locking script (needs the holder's
 * keys); the token-server (/identity/publish) funds + broadcasts (the mobile
 * wallet has 0 sats).
 */

import { Certificate, PushDrop, PrivateKey, AuthFetch, Utils } from "@bsv/sdk"
import type { WalletCertificate, WalletInterface, SecurityLevel } from "@bsv/sdk"

const TOKEN_SERVER_URL = process.env.EXPO_PUBLIC_TOKEN_SERVER_URL

const IDENTITY_PROTOCOL_ID: [SecurityLevel, string] = [1, 'identity']
const TOKEN_AMOUNT = 1

export async function publishIdentityCertificate({ cert, wallet, fieldsToReveal }: {
    cert: WalletCertificate, 
    wallet: WalletInterface, 
    fieldsToReveal: string[]
} ) {
    if (!wallet) return 

    try {
        const masterCert = new Certificate(
            cert.type, cert.serialNumber, cert.subject, cert.certifier,
            cert.revocationOutpoint, cert.fields, cert.signature
        )
        await masterCert.verify()

        const { keyringForVerifier } = await wallet.proveCertificate({
            certificate: cert,
            fieldsToReveal,
            verifier: new PrivateKey(1).toPublicKey().toString()
        })

        const lockingScript = await new PushDrop(wallet).lock(
            [Utils.toArray(JSON.stringify({ ...cert, keyring: keyringForVerifier }))],
            IDENTITY_PROTOCOL_ID,
            '1',
            'anyone',
            true,
            true
        )
        
        const authFetch = new AuthFetch(wallet)
        const response = await authFetch.fetch(`${TOKEN_SERVER_URL}/identity/publish`, {
            method: 'POST',
            headers: { 'content-type': 'application/json'},
            body: JSON.stringify({
                lockingScript: lockingScript.toHex(),
                tokenAmount: TOKEN_AMOUNT
            })
        })

        const result = await response.json()
        console.log('cert published via server:', JSON.stringify(result))
        return result

    } catch (error) {
        console.log('publishIdentityCertificate error:', error)
    }
 } 