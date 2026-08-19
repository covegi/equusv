import { Router } from 'express'
import type { Request, Response } from 'express'
import { Wallet } from '@bsv/wallet-toolbox'
import { Transaction, TopicBroadcaster } from '@bsv/sdk'

const LARS_URL = process.env.LARS_URL

export default (wallet: Wallet) => {
    const router = Router()

    router.post('/identity/publish', async (req: Request, res: Response) => {
        const { lockingScript, tokenAmount } = req.body

        const { BEEF } = await wallet.listOutputs({
            basket: 'default',
            include: 'entire transactions'
        })

        const { tx } = await wallet.createAction({
            description: 'Publish identity token',
            outputs: [{
                lockingScript,
                satoshis: tokenAmount,
                outputDescription: 'Identity Token'
            }],
            options: { randomizeOutputs: false }
        })

        if (!tx) throw new Error('No transaction data.')

        // const broadcaster = new TopicBroadcaster(['tm_identity'], {
        //     networkPreset: 'mainnet'
        // })
        // await broadcaster.broadcast(Transaction.fromAtomicBEEF(tx))

        const finalTransaction = Transaction.fromAtomicBEEF(tx)
        const outputIndex = finalTransaction.outputs.findIndex(
            out => out.lockingScript.toHex() === lockingScript
        )

        const overlayResp = await fetch(`${LARS_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'X-Topics': JSON.stringify(['tm_identity'])
            },
            body: Buffer.from(tx)
        })

        const overlayBody = await overlayResp.json().catch(() => overlayResp.text())
        console.log('Overlay submit status:', overlayResp.status, JSON.stringify(overlayBody))

        return res.json({
            tx: Buffer.from(tx).toString('base64'),
            txid: finalTransaction.id('hex'),
            outputIndex 
        })
    })

    return router
}