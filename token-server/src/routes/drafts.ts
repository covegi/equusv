import { Draft } from '../models/drafts.js'
import { Router } from 'express'
import type { Request, Response } from 'express'
import type { WalletInterface } from '@bsv/sdk'

export default (wallet: WalletInterface) => {
    const router = Router()

    router.put('/draft', async (req: Request, res: Response) => {
        const { tokenType, encryptedData, identityKey, status, ueln } = req.body

        try {
            const draft = await Draft.findOneAndUpdate(
                { identityKey, ueln, tokenType },
                {
                    $set: {
                        tokenType,
                        encryptedData,
                        identityKey,
                        status,
                        ueln,
                        updatedAt: new Date().toISOString()
                    },
                    $setOnInsert: {
                        createdAt: new Date().toISOString()
                    }
                },
                { upsert: true, returnDocument: 'after' }
            )

            return res.json({ success: true, draft})

        } catch (error) {
            console.error(error)
            return res.status(500).json({ error: 'Failed to save draft'})
        }
    })

    router.delete('/draft', async (req: Request, res: Response) => {
        const { identityKey, ueln, tokenType } = req.body

        try {
            await Draft.deleteOne({ identityKey, ueln, tokenType })
            return res.json({ success: true })
        } catch (error) {
            console.error(error)
            return res.status(500).json({ error: 'Failed to delete draft' })
        }
    })

    return router
}