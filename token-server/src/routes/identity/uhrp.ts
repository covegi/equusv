import { Router } from "express"
import type { Request, Response } from "express"
import { Transaction, PushDrop, StorageUploader, PublicKey, ECIES, StorageUtils } from '@bsv/sdk'
import type { WalletInterface } from "@bsv/sdk"
import type { StorageUploaderInternal } from "../../types/uhrp-storage-uploader.js"

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
            }) as unknown as StorageUploaderInternal

            let uhrpUrl: string | undefined
            let cdnUrl: string | undefined

            try {
                const data = new Uint8Array(encryptedBuffer)

                const { uploadURL, requiredHeaders } = await storageUploader.getUploadURL(
                    STORAGE_URL!,
                    data.byteLength,
                    180
                )

                const objectID = new URL(uploadURL).searchParams.get('objectID')
                if (!objectID) {
                    throw new Error(`uploadURL missing objectID param: ${uploadURL}`)
                }

                await storageUploader.putFile(
                    uploadURL,
                    data,
                    'application/octet-stream',
                    requiredHeaders
                )

                uhrpUrl = StorageUtils.getURLForFile(data)
                cdnUrl = `${STORAGE_URL}/cdn/${objectID}`
                console.log('uhrpURL:', uhrpUrl, 'cdnUrl:', cdnUrl)
            } catch (error) {
                console.error(error)
                return res.status(500).json({ error: 'UHRP upload failed' })
            }

            const pushDrop = new PushDrop(wallet)
            const createdAt = new Date().toISOString()
            const VERSION = '1'

            const fields = [
                VERSION,
                id,
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
                id,
                identityKey,
                true
            )

            const result = await wallet.createAction({
                description: `Create file token for ${id}`,
                outputs: [
                    {  
                        lockingScript: lockingScript.toHex(),
                        satoshis: 1,
                        outputDescription: `File token for ${id} (${tokenType})`,
                        basket: `equusv-${id}`,
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