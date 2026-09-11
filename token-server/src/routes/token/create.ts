import { Router } from 'express'
import type { Request, Response } from 'express'
import type { WalletInterface, WalletOutput, CreateActionArgs, WalletProtocol } from '@bsv/sdk'
import { schemas, buildFields } from '@equusv/core'
import { PushDrop, Transaction } from '@bsv/sdk'

export default (wallet: WalletInterface) => {
    const router = Router()

    router.post('/token/create', async (req: Request, res: Response) => {
        try {
            const { subCategory, anchorTxid, uuid, values, identityKey } = req.body

            if (!subCategory) {
                return res.status(400).json({ error: 'subCategory is required' })
            }
            if (!anchorTxid) {
                return res.status(400).json({ error: 'anchorTxid is required' })
            }
            if (!uuid) {
                return res.status(400).json({ error: 'uuid is required' })
            }
            if (!identityKey) {
                return res.status(400).json({ error: 'identityKey is required' })
            }

            const schema = schemas[subCategory]

            if (!schema) {
                return res.status(400).json({ error: `Unknown subCategory: ${subCategory}` })
            }

            const category = schema.category

            for (const field of schema.fields) {
                if (field.required) {   
                    const value = values?.[field.name]
                    if (value === undefined || value === null || value === '') {
                        return res.status(400).json({ error: `Missing required field: ${field.name}` })
                    }
                }
            }

            const createdAt = new Date().toISOString()

            const fields = buildFields(schema, values, { uuid, anchorTxid, createdAt })

            const pushdrop = new PushDrop(wallet)

            const keyID = `${uuid}:${category}:${subCategory}`

            const protocolID: WalletProtocol = [2, 'equusv token']

            const lockingScript = await pushdrop.lock(
                fields,
                protocolID,
                keyID,
                identityKey,
                true
            )

            const basket = 'equusv-tokens'
            const tags = [`anchor:${anchorTxid}`, `subCategory:${subCategory}`]

            let spendable: WalletOutput[] = []
            let inputBEEF

            if (schema.mode === 'status') {
                const result = await wallet.listOutputs({
                    basket,
                    tags,
                    tagQueryMode: 'all',
                    include: 'entire transactions'
                })
                spendable = result.outputs.filter(o => o.spendable)
                inputBEEF = result.BEEF
            }

            const args: CreateActionArgs = {
                description: `Create ${subCategory}`,
                outputs: [
                    {
                        lockingScript: lockingScript.toHex(),
                        satoshis: 1,
                        outputDescription: subCategory,
                        basket,
                        tags    
                    }
                ]
            }

            if (spendable.length > 0) {
                args.inputs = spendable.map(o => ({
                    outpoint: o.outpoint,
                    inputDescription: 'Spend previous version',
                    unlockingScriptLength: 73
                }))
                args.inputBEEF = inputBEEF
            }

            const result = await wallet.createAction(args)

            let finalTx
            let finalTxid

            if (result.signableTransaction) {
                const st = result.signableTransaction
                const tx = Transaction.fromAtomicBEEF(st.tx)

                const spends: Record<number, { unlockingScript: string}> = {}

                for (const o of spendable) {
                    const [txid, vout] = o.outpoint.split('.')

                    const inputIndex = tx.inputs.findIndex(
                        input => input.sourceTXID === txid && input.sourceOutputIndex === Number(vout)
                    )

                    if (inputIndex === -1) {
                        throw new Error(`Input not found: ${o.outpoint}`)
                    }

                    const unlocker = pushdrop.unlock(
                        protocolID,
                        keyID,
                        identityKey,
                        'all',
                        false,
                        1
                    )

                    spends[inputIndex] = {
                        unlockingScript: (await unlocker.sign(tx, inputIndex)).toHex()
                    }
                }

                const signed = await wallet.signAction({
                    reference: st.reference,
                    spends
                })

                finalTx = signed.tx
                finalTxid = signed.txid
            } else {
                finalTx = result.tx
                finalTxid = result.txid
            }

            const LARS_URL = process.env.LARS_URL

            if (!finalTx) throw new Error('No transaction produced')

            const submitResponse = await fetch(`${LARS_URL}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'X-Topics': JSON.stringify(['tm_equusv'])
                },
                body: Buffer.from(finalTx)
            })

            if (!submitResponse.ok) throw new Error(`Overlay submit failed: ${submitResponse.status}`)


            type SubmitResult = {
                [topic: string]: { outputsToAdmit: number[], coinsToRetain: number[]}
            }
            const submitResult = await submitResponse.json() as SubmitResult
            const admitted = submitResult?.tm_equusv?.outputsToAdmit ?? []

            if (admitted.length === 0) {
                throw new Error('Token was not admitted by tm_equusv')
            }

            return res.json({ txid: finalTxid })


        } catch (error) {
            console.error(error)
            return res.status(500).json({ error: 'failed to create token'})
        }
    })

    return router
}