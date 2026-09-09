import { Router } from "express"
import type { Request, Response } from 'express'
import type { WalletInterface, WalletActionOutput, CreateActionArgs, WalletProtocol } from "@bsv/sdk"
import { PushDrop, Transaction, Utils, Hash } from '@bsv/sdk'
import { buildAnchorFields, serializeFields } from "@equusv/core"

export default (wallet: WalletInterface) => {
    const router = Router()

    router.post('/token/anchor', async (req: Request, res: Response) => {
        try {
            const { uuid } = req.body

            if (!uuid) {
                return res.status(400).json({ error: 'uuid is required' })
            }

            const { publicKey } = await wallet.getPublicKey({ identityKey: true })
            const issuerIdentityKey = publicKey

            const createdAt = new Date().toISOString()

            const fields = buildAnchorFields({
                uuid,
                createdAt,
                issuerIdentityKey
            }) 

            const serialized = serializeFields(fields)
            const hash = Hash.sha256(serialized)

            const protocolID: WalletProtocol = [2, 'equusv anchor']
            const keyID = `${uuid}:anchor:anchor`
            
            const { signature } = await wallet.createSignature({
                hashToDirectlySign: hash,
                protocolID,
                keyID,
                counterparty: 'anyone'
            })

            fields.push(signature)

            const pushdrop = new PushDrop(wallet)

            const lockingScript = await pushdrop.lock(
                fields,
                protocolID,
                keyID,
                'anyone',
                true
            )

            const args: CreateActionArgs = {
                description: `Create anchor: ${uuid}`,
                outputs: [
                    {
                        lockingScript: lockingScript.toHex(),
                        satoshis: 1,
                        outputDescription: 'Horse anchor',
                        basket: 'equusv-tokens',
                        tags: [`anchor:${uuid}`]
                    }
                ]
            }

            const result = await wallet.createAction(args)

            const finalTx = result.tx
            const finalTxid = result.txid

            if (!finalTx) throw new Error('No transaction data')
            
            const LARS_URL = process.env.LARS_URL

            await fetch(`${LARS_URL}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'X-Topics': JSON.stringify(['tm_equusv'])
                },
                body: Buffer.from(finalTx)
            })

            return res.json({ txid: finalTxid, uuid })

        } catch (error) {
            console.error(error)
            return res.status(500).json({ error: 'Failed to create anchor' })
        }
    })

    return router
}


