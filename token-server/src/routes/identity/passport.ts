import { Router } from 'express'
import type { Request, Response } from 'express'
import { Transaction, PushDrop, Hash, Utils } from '@bsv/sdk'
import type { AtomicBEEF } from '@bsv/sdk'
import { type CreateActionArgs, type WalletInterface, ProtoWallet } from '@bsv/sdk'
import type { HorsePassportRecord } from '../../types/horse-passport-record.js'
import { buildPassportFields, serializeFields } from '../../utils/passportFields.js'
import { PASSPORT_BASKET, tagHorse, TAG_STATUS_PENDING, TAG_STATUS_ACTIVE } from '../../constants/baskets.js'

const LARS_URL = process.env.LARS_URL
const VERSION = '2'

export default (wallet: WalletInterface) => {
    const router = Router()

    router.post('/identity/passport/create', async (req: Request, res: Response) => {
        try {
            const { record, identityKey }: { record: HorsePassportRecord, identityKey: string } = req.body

            const horse = record.horse

            if (!horse?.id) {
                return res.status(400).json({ error: 'Record ID is required' })
            }

            if (record.status !== 'pending') {
                return res.status(400).json({ error: 'Status must be pending on submit' })
            }

            const pushdrop = new PushDrop(wallet)

            const fullRecord = { ...record, version: VERSION, identityKey }
            const fields = buildPassportFields(fullRecord)

            console.log('Fields:', fields.map((f, i) => `[${i}]: "${Buffer.from(f).toString('utf-8')}"`))

            const { outputs, BEEF } = await wallet.listOutputs({
                basket: PASSPORT_BASKET,
                tags: [tagHorse(horse.id), TAG_STATUS_PENDING],
                tagQueryMode: 'all',
                include: 'entire transactions'
            })

            const lockingScript = await pushdrop.lock(
                fields,
                [2, 'equusv identity passport'],
                horse.id,
                identityKey,
                true,
            )

            const spendable = outputs.filter(o => o.spendable)
            console.log('spendable outputs:', spendable.length, spendable.map(o => o.outpoint))

            const args: CreateActionArgs = {
                description: `${record.status} passport: ${horse.name}`,
                outputs: [
                    {
                        lockingScript: lockingScript.toHex(),
                        satoshis: 1,
                        outputDescription: `Horse passport for ${horse.name}`,
                        basket: PASSPORT_BASKET,
                        customInstructions: JSON.stringify({ type: 'horse-passport' }),
                        tags: [tagHorse(horse.id), TAG_STATUS_PENDING]
                    }
                ]
            }

            if (spendable.length > 0) {
                args.inputs = spendable.map(o => ({
                    outpoint: o.outpoint,
                    inputDescription: 'Spend previous passport token',
                    unlockingScriptLength: 73
                }))
                args.inputBEEF = BEEF
            }

            const result = await wallet.createAction(args)

            let finalTx: AtomicBEEF | undefined
            let finalTxid: string | undefined

            if (result.signableTransaction) {
                const st = result.signableTransaction
                const tx = Transaction.fromAtomicBEEF(st.tx)
            
            console.log('inputs:', tx.inputs.length, 'spendable:', spendable.length)

            const spends: Record<number, { unlockingScript: string }> = {}

            for (const o of spendable) {
                const [txid, vout] = o.outpoint.split('.')
                
                const inputIndex = tx.inputs.findIndex(
                    input => input.sourceTXID === txid && input.sourceOutputIndex === Number(vout)
                )

                if (inputIndex === -1) {
                    throw new Error(`Input not found in transaction: ${o.outpoint}`)
                }

                const unlocker = pushdrop.unlock(
                    [2, 'equusv identity passport'],
                    horse.id,
                    identityKey,
                    'all',
                    false,
                    1
                )

                spends[inputIndex] = { unlockingScript: (await unlocker.sign(tx, inputIndex)).toHex() }
            }

            const signed = await wallet.signAction({
                reference: st.reference,
                spends
            })

            finalTx = signed.tx
            finalTxid = signed.txid

            console.log('signed txid:', finalTxid, 'inputs spent:', spendable.length)

        } else {
            finalTx = result.tx
            finalTxid = result.txid
        }
            
            if (!finalTx) throw new Error('No transaction data.')
            const finalTransaction = Transaction.fromAtomicBEEF(finalTx)
            const outputIndex = finalTransaction.outputs.findIndex(out => out.lockingScript.toHex() === lockingScript.toHex())
            console.log('outputIndex found:', outputIndex)

            if (outputIndex === -1) {
                throw new Error('PushDrop output not found in transaction')
            }

            await fetch(`${LARS_URL}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'X-Topics': JSON.stringify(['tm_horse_passport'])   
                },
                body: Buffer.from(finalTx)
            })
            console.log(`Submitted to LARS overlay: ${finalTxid}`)

            return res.json({
                tx: Buffer.from(finalTx).toString('base64'), 
                txid: finalTxid,
                outputIndex
            })

        } catch (error) {
            console.error(error)
            return res.status(500).json({ error: 'Failed to create token' })
        }
    })

    router.post('/identity/passport/approve', async (req: Request, res: Response) => {
        try {
            const { record, hash, signature, certifierIdentityKey }: { record: HorsePassportRecord, hash: string, signature: string, certifierIdentityKey: string } = req.body

            if (!record.horse.id) {
                return res.status(400).json({ error: 'Record ID is required'})
            }

            if (record.version !== VERSION) {
                return res.status(400).json({ error: 'Unsupported token version' })
            }

            if (record.status !== 'active') {
                return res.status(400).json({ error: 'Status must be active on approval' })
            }

            if (!record.identityKey) {
                return res.status(400).json({ error: 'identityKey is required' })
            }

            const fields = buildPassportFields(record)
            const serialized = serializeFields(fields)
            const hashed = Hash.sha256(serialized)
            const recordHash = Utils.toHex(hashed)

           if (hash !== recordHash) {
            return res.status(400).json({ error: 'Record hash does not match' })
           }

           try {
                const anyoneWallet = new ProtoWallet('anyone')

                const { valid } = await anyoneWallet.verifySignature({
                    hashToDirectlyVerify: hashed,
                    signature: Utils.toArray(signature, 'hex'),
                    protocolID: [2, 'equusv identity passport'],
                    keyID: record.horse.id,
                    counterparty: certifierIdentityKey
                })
                if (!valid) {
                    return res.status(400).json({ error: 'Invalid signature. Approval not authorized.' })
                }
           } catch (error) {
                console.error(error)
                return res.status(400).json({ error: 'Invalid signature' })
           }

           const tokenFields = [
                ...fields,
                Utils.toArray(hash, 'utf8'),
                Utils.toArray(signature, 'utf8'),
                Utils.toArray(certifierIdentityKey, 'utf8')
           ]

            const pushdrop = new PushDrop(wallet)

            console.log('counterparty:', record.identityKey)

            const { outputs, BEEF } = await wallet.listOutputs({
                basket: PASSPORT_BASKET,
                tags: [tagHorse(record.horse.id), TAG_STATUS_PENDING],
                tagQueryMode: 'all',
                include: 'entire transactions'
            })

            const spendable = outputs.filter(o => o.spendable)
            console.log('spendable outputs:', spendable.length, spendable.map(o => o.outpoint))

            if (spendable.length === 0) {
                return res.status(400).json({ error: 'No pending passport token found' })
            }

            const lockingScript = await pushdrop.lock(
                tokenFields,
                [2, 'equusv identity passport'],
                record.horse.id,
                record.identityKey,
                true
            )

            const args: CreateActionArgs = {
                description:  `Passport approved: ${record.horse.name?.slice(0, 20)}`,
                inputs: spendable.map(o => ({
                    outpoint: o.outpoint,
                    inputDescription: 'Spend pending passport token',
                    unlockingScriptLength: 73
                })),
                inputBEEF: BEEF,
                outputs: [
                    {
                        lockingScript: lockingScript.toHex(),
                        satoshis: 1,
                        outputDescription: `Approved horse passport for ${record.horse.name?.slice(0, 20)}`,
                        basket: PASSPORT_BASKET,
                        customInstructions: JSON.stringify({ type: 'horse-passport' }),
                        tags: [tagHorse(record.horse.id), TAG_STATUS_ACTIVE]
                    }
                ]
            }

            const result = await wallet.createAction(args)

            if (!result.signableTransaction) {
                throw new Error('Expected signableTransaction')
            }

            const st = result.signableTransaction
            const tx = Transaction.fromAtomicBEEF(st.tx)

            console.log('inputs:', tx.inputs.length, 'spendable:', spendable.length)

            const spends: Record<number, { unlockingScript: string }> = {}

            for (const o of spendable) {
                const [txid, vout] = o.outpoint.split('.')

                const inputIndex = tx.inputs.findIndex(
                    input => input.sourceTXID === txid && input.sourceOutputIndex === Number(vout)
                )

                if (inputIndex === -1) {
                    throw new Error(`Input not found in transaction: ${o.outpoint}`)
                } 

                const unlocker = pushdrop.unlock(
                    [2, 'equusv identity passport'],
                    record.horse.id,
                    record.identityKey,
                    'all',
                    false,
                    1
                )

                spends[inputIndex] = { unlockingScript: ( await unlocker.sign(tx,inputIndex)).toHex() }
            }

            const signed = await wallet.signAction({ 
                reference: st.reference,
                spends
            })

            const finalTx = signed.tx
            const finalTxid = signed.txid

            console.log('approved txid:', finalTxid)

            if (!finalTx) throw new Error('No transaction data.')

            const finalTransaction = Transaction.fromAtomicBEEF(finalTx)
            const outputIndex = finalTransaction.outputs.findIndex(
                out => out.lockingScript.toHex() === lockingScript.toHex()
            )

            if (outputIndex === -1) {
                throw new Error('PushDrop output not found in transaction')
            }

            await fetch(`${LARS_URL}/submit`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/octet-stream',
                    'X-Topics': JSON.stringify(['tm_horse_passport'])
                },
                body: Buffer.from(finalTx)
            })

            console.log(`Submitted to LARS overlay: ${finalTxid}`)

            return res.json({
                tx: Buffer.from(finalTx).toString('base64'),
                txid: finalTxid,
                outputIndex
            })


        } catch (error) {
            console.error(error)
            return res.status(500).json({ error: 'Failed to approve passport' })
        }
    }) 

    return router
}