import { Router } from "express"
import type { Request, Response } from "express"
import { Wallet } from "@bsv/wallet-toolbox"

export default ( wallet: Wallet ) => {
    const router = Router()

    router.get('/utils/identityKey', async (req: Request, res: Response) => {
        const identityKey = wallet.identityKey

        return res.json({ identityKey: identityKey })
    })

    return router
}