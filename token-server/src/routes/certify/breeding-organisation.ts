import { Router } from "express"
import type { Request, Response } from 'express'
import { MasterCertificate, createNonce, Utils } from "@bsv/sdk"
import { Wallet } from '@bsv/wallet-toolbox'
import { CERT_TYPE_BREEDING_ORG } from "../../constants.js"

export default (wallet: Wallet) => {
    const router = Router()

    router.post('/certify/breeding-organisation/signCertificate', async (req: Request, res: Response) => {
        const { clientNonce, type, fields, masterKeyring } = req.body

        const serverNonce = await createNonce(wallet, req.auth!.identityKey)

        const { hmac } = await wallet.createHmac({
            data: Utils.toArray(clientNonce + serverNonce, 'base64'),
            protocolID: [2, 'certificate issuance'],
            keyID: serverNonce + clientNonce,
            counterparty: req.auth!.identityKey
        })

        const serialNumber = Utils.toBase64(hmac)

        const certifierPublicKey = (await wallet.getPublicKey({ identityKey: true })).publicKey

        const cert = new MasterCertificate(
            CERT_TYPE_BREEDING_ORG,
            serialNumber,
            req.auth!.identityKey,
            certifierPublicKey,
            '00'.repeat(32),
            fields,
            masterKeyring
        )

        await cert.sign(wallet as any)

        res.json({
            certificate: cert,
            serverNonce
        })
    })

    return router
}  