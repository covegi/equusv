import { Router } from 'express'
import { PushDrop, Transaction, Utils, P2PKH, PublicKey } from '@bsv/sdk'
import type { Request, Response} from 'express'
import type { CreateActionArgs, WalletInterface } from '@bsv/sdk'

const LARS_URL = process.env.LARS_URL

export default (wallet: WalletInterface) => {
    const router = Router()

    router.post('/admin/spend', async (req: Request, res: Response) => {
        try {
            const { baskets, ownerIdentityKey }: { baskets:  {basket: string; beef: number[]; outpoints: string[]}[], ownerIdentityKey: string} = req.body

            const pushdrop = new PushDrop(wallet)
            const results: any[] = []

            for (const { basket, beef, outpoints } of baskets) {
                try {
                    const { publicKey } = await wallet.getPublicKey({ identityKey: true })
                    const serverLock = new P2PKH().lock(PublicKey.fromString(publicKey).toAddress()).toHex() 

                    const args: CreateActionArgs = {
                        description: `spend tokens`.slice(0, 50),
                        inputBEEF: beef,
                        inputs: outpoints.map(outpoint => ({
                            outpoint,
                            inputDescription: 'spend token',
                            unlockingScriptLength: 73
                        })),
                        outputs: [
                            {
                                lockingScript: serverLock,
                                satoshis: 1,
                                outputDescription: 'reclaimed sats',
                                basket: 'reclaimed'
                            }
                        ]
                    }

                    const result = await wallet.createAction(args)
                    if (!result.signableTransaction) throw new Error('no signable tx')

                    const st = result.signableTransaction
                    const tx = Transaction.fromAtomicBEEF(st.tx)
                    const spends: Record<number, { unlockingScript: string }> = {}

                    for (const outpoint of outpoints) {
                        const [txid, vout] = outpoint.split('.')
                        const idx = tx.inputs.findIndex(
                            x => x.sourceTXID === txid && x.sourceOutputIndex === Number(vout)
                        )
                        if (idx === -1) throw new Error(`input not found: ${outpoint}`)

                        const sourceOutput = tx.inputs[idx].sourceTransaction!.outputs[Number(vout)]
                        const keyID = Utils.toUTF8(PushDrop.decode(sourceOutput.lockingScript).fields[2])

                        const unlocker = pushdrop.unlock(
                            [2, 'equusv identity passport'],
                            keyID,
                            ownerIdentityKey,
                            'all', false, 1
                        )
                        spends[idx] = { unlockingScript: (await unlocker.sign(tx, idx)).toHex() }
                    }

                    const signed = await wallet.signAction({ reference: st.reference, spends })

                    const finalTx = signed.tx
                    const finalTxid = signed.txid

                    await fetch(`${LARS_URL}/submit`, {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/octet-stream',
                            'X-Topics': JSON.stringify(['tm_horse_passport'])
                        },
                        body: Buffer.from(finalTx!)
                    })
                    console.log('spent + submitted', basket, '→', finalTxid)
                    results.push({ basket, txid: finalTxid, spent: outpoints.length })

                } catch (error: any) {
                    console.error('failed basket', basket, error?.message)
                    results.push({ basket, error: error?.message })
                }
            }

            return res.json({ results })
        } catch (error) {
            console.error(error)
            return res.status(500).json({ error: 'Spend failed' })
        }
    })

    return router
}