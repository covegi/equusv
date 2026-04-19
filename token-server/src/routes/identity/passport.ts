import { Router } from 'express'
import type { Request, Response } from 'express'
import { Transaction, PushDrop } from '@bsv/sdk'
import type { WalletInterface } from '@bsv/sdk'
import type { HorsePassport } from '../../types/horse-passport.js'
import { uploadToUhrp } from '../../services/uhrp.js'

const LARS_URL = process.env.LARS_URL

export default (wallet: WalletInterface) => {
    const router = Router()

    router.post('/identity/passport/create', async (req: Request, res: Response) => {
        try {
            const { base64body, horse, identityKey }: { base64body: string, horse: HorsePassport, identityKey: string } = req.body

            const uhrpUrl = await uploadToUhrp(base64body, wallet)

            const pushdrop = new PushDrop(wallet)

            const VERSION = '1'

            const fields = [
                VERSION,
                horse.name,
                horse.breed,
                horse.birthDate,
                horse.sex,
                horse.color,
                horse.ueln,
                horse.chip,
                horse.ownerAtRegistration,
                horse.location,
                horse.organisation,
                horse.issuedDate,
                horse.foodChainStatus.toString(),
                uhrpUrl ?? ''
            ].map(field => Array.from(Buffer.from(field ?? '', 'utf-8')))

            const lockingScript = await pushdrop.lock(
                fields,
                [2, 'equusv identity passport'],
                horse.ueln!,
                identityKey,
                true,
            )

            console.log('calling createAction...')
            const result = await wallet.createAction({
                description: `Create horse passport for ${horse.name}`,
                outputs: [
                    {
                        lockingScript: lockingScript.toHex(),
                        satoshis: 1,
                        outputDescription: `Horse passport for ${horse.name}`,
                        basket: `equusv-${horse.ueln}`,
                        customInstructions: JSON.stringify({ type: 'horse-passport' }),
                        tags: ['passport']
                    }
                ]
            })
            console.log('createAction done, txid:', result.txid)

            const tx = Transaction.fromAtomicBEEF(result.tx!)
            console.log('tx outputs count:', tx.outputs.length)
            const outputIndex = tx.outputs.findIndex(out => out.lockingScript.toHex() === lockingScript.toHex())
            console.log('outputIndex found:', outputIndex)

            if (outputIndex === -1) {
                throw new Error('PushDrop output not found in transaction')
            }

            if (!result.tx) throw new Error('No transaction data.')

            await fetch(`${LARS_URL}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'X-Topics': JSON.stringify(['tm_horse_passport'])   
                },
                body: Buffer.from(result.tx)
            })
            console.log(`Submitted to LARS overlay: ${result.txid}`)

            return res.json({
                tx: Buffer.from(result.tx!).toString('base64'), 
                txid: result.txid,
                outputIndex
            })

        } catch (error) {
            console.error(error)
            return res.status(500).json({ error: 'Failed to create token' })
        }
    })
    return router
}

