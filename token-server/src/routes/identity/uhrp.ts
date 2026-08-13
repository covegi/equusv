import { Router } from "express"
import type { Request, Response } from "express"
import { Transaction, PushDrop, StorageUploader, PublicKey, ECIES } from '@bsv/sdk'
import type { WalletInterface } from "@bsv/sdk"

const LARS_URL = process.env.LARS_URL
const STORAGE_URL = process.env.STORAGE_URL

export default (wallet: WalletInterface) => {
    const router = Router()

    router.post('/identity/file/create', async (req: Request, res: Response) => {
        try {
            const { base64body, ueln, id,   tokenType, mimeType, description, parentTxid, identityKey } = req.body

            const pubKey = PublicKey.fromString(identityKey)
            const rawBuffer = Buffer.from(base64body, 'base64')
            const encrypted = ECIES.electrumEncrypt(Array.from(rawBuffer), pubKey)
            const encryptedBuffer = Buffer.from(encrypted)

            const storageUploader = new StorageUploader({
                storageURL: STORAGE_URL!,
                wallet: wallet
            })

            let uhrpUrl: string | undefined
            let cdnUrl: string | undefined

            try {
                const uploadFileResult = await storageUploader.publishFile({
                    file: {
                        data: new Uint8Array(encryptedBuffer),
                        type: 'application/octet-stream'
                    },
                    retentionPeriod: 60
                })
                if (uploadFileResult) {
                    uhrpUrl = uploadFileResult.uhrpURL
                    cdnUrl = undefined // temporary
                    console.log('uhrpURL:', uploadFileResult.uhrpURL)
                }
            } catch (error) {
                console.error(error)
                return res.status(500).json({ error: 'UHRP upload failed' })
            }


            const pushDrop = new PushDrop(wallet)
            const createdAt = new Date().toISOString()
            const VERSION = '1'

            const fields = [
                VERSION,
                ueln,
                uhrpUrl,
                tokenType,
                mimeType,
                description,
                createdAt,
                parentTxid,
                cdnUrl
            ].map(field => Array.from(Buffer.from(field ?? '', 'utf-8')))

            const lockingScript = await pushDrop.lock(
                fields,
                [2, 'equusv identity file'],
                ueln,
                identityKey,
                true
            )

            const result = await wallet.createAction({
                description: `Create file token for ${ueln}`,
                outputs: [
                    {  
                        lockingScript: lockingScript.toHex(),
                        satoshis: 1,
                        outputDescription: `File token for ${ueln} (${tokenType})`,
                        basket: `equusv-${ueln}`,
                        customInstructions: JSON.stringify({ type: ''})
                    }
                ]
            })

            const tx = Transaction.fromAtomicBEEF(result.tx!)
            const outputIndex = tx.outputs.findIndex(out => out.lockingScript.toHex() === lockingScript.toHex())

            if (outputIndex === -1) {
                throw new Error('No pushdrop found in transaction')
            }

            if (!result.tx) {
                throw new Error('No transaction data')
            }

            const larsResp = await fetch(`${LARS_URL}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'X-Topics': JSON.stringify(['tm_uhrp'])
                },
                body: Buffer.from(result.tx)
            })
            const larsBody = await larsResp.json().catch(() => larsResp.text())
            console.log('LARS submit status:', larsResp.status, JSON.stringify(larsBody))

            return res.json({
                tx: Buffer.from(result.tx).toString('base64'),
                txid: result.txid,
                outputIndex,
                uhrpUrl,
                cdnUrl
            })

        } catch (error) {
            console.error(error)
            return res.status(500).json({ error: 'Failed to create token'})
        }
    })
    return router
}