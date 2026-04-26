import { Router } from 'express'
import type { Request, Response } from 'express'
import { MasterCertificate } from '@bsv/sdk'
import { Wallet } from '@bsv/wallet-toolbox'
import { CERT_TYPE_HORSE_OWNER } from '../../constants.js'

export default (wallet: Wallet) => {
    const router = Router()

    router.post('/certify/horse-owner', async (req: Request, res: Response) => {
        const { clientNonce, type, fields, masterKeyring } = req.body

        const cert = await MasterCertificate.issueCertificateForSubject(
            wallet,
            req.auth!.identityKey,
            { role: 'equusv-horse-owner' },
            CERT_TYPE_HORSE_OWNER
        )

        res.json({ certificate: cert})
    })

    return router
}   