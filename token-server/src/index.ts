    import express from 'express'
    import type { NextFunction, Request, Response } from 'express'
    import dotenv from 'dotenv'
    import { Setup } from '@bsv/wallet-toolbox'
    import { StorageUploader, PushDrop, Transaction } from '@bsv/sdk'
    import { type CreateActionResult, type WalletInterface } from '@bsv/sdk'
    import { createAuthMiddleware } from '@bsv/auth-express-middleware'
    import type { Horse } from './types/horse.ts'

    dotenv.config()
    const app = express()
    const PORT = process.env.PORT ?? 3000
    app.use(express.json({ limit: '10mb' }))

    const init = async () => {
        const STORAGE_URL = process.env.STORAGE_URL
        const EQUUS_ROOT_KEY = process.env.EQUUSV_ROOT_KEY

        const wallet = await Setup.createWalletClientNoEnv({
            chain: 'main',
            rootKeyHex: EQUUS_ROOT_KEY!,
        })

        const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Headers', 
                'Content-Type, ' +
                'x-bsv-auth-version, ' +
                'x-bsv-auth-message-type, ' +
                'x-bsv-auth-identity-key, ' +
                'x-bsv-auth-nonce, ' +
                'x-bsv-auth-your-nonce, ' +
                'x-bsv-auth-signature, ' +
                'x-bsv-auth-request-id, ' +
                'x-bsv-auth-requested-certificates, ' +
                'x-bsv-auth-version, ' +
                'x-bsv-auth-identity-key, ' +
                'x-bsv-auth-signature'
            )
            res.header('Access-Control-Allow-Methods', '*')
            res.header('Access-Control-Expose-Headers',
                'x-bsv-auth-version, ' +
                'x-bsv-auth-message-type, ' +
                'x-bsv-auth-identity-key, ' +
                'x-bsv-auth-nonce, ' +
                'x-bsv-auth-your-nonce, ' +
                'x-bsv-auth-signature, ' +
                'x-bsv-auth-request-id, ' +
                'x-bsv-auth-requested-certificates, ' +
                'x-bsv-auth-version, ' +
                'x-bsv-auth-identity-key, ' +
                'x-bsv-auth-signature'
            )
            res.header('Access-Control-Allow-Private-Network', 'true')
            if (req.method === 'OPTIONS') {
            res.sendStatus(200)
            return
            } 
            next()
        }

        app.use((req, res, next) => {
            console.log('Path:', req.path)
            console.log('Headers:', req.headers)
            console.log('Body type:', typeof req.body)
            next()
        })

        const authMiddleware = createAuthMiddleware({
            wallet: wallet,
            allowUnauthenticated: false
        })

        app.use(corsMiddleware)
        app.use(authMiddleware)

        const uploadToUhrp = async (base64body: string): Promise<string | undefined> => {
            const encryptedBuffer = Buffer.from(base64body, 'base64')
        
            const storageUploader = new StorageUploader({
                storageURL: STORAGE_URL!,
                wallet: wallet
            })

            try {
                const uploadFileResult = await storageUploader.publishFile({
                    file: {
                        data: new Uint8Array(encryptedBuffer),
                        type: 'application/octet-stream'
                    },
                    retentionPeriod: 60
                })
                if (uploadFileResult) {
                    console.log('uploadFileResult:', uploadFileResult)
                    return uploadFileResult.uhrpURL
                }
            } catch (error) {
                console.error(error)
            }
        }

        app.post('/create-token', async (req: Request, res: Response) => {
            try {
                const { base64body, horse, identityKey }: { base64body: string, horse: Horse, identityKey: string } = req.body

                const uhrpUrl = await uploadToUhrp(base64body)

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
                    horse.owner,
                    horse.location,
                    horse.organisation,
                    horse.issuedDate,
                    horse.foodChainStatus,
                    uhrpUrl ?? ''
                ].map(field => Array.from(Buffer.from(field ?? '', 'utf-8')))

                const lockingScript = await pushdrop.lock(
                    fields,
                    [2, 'equusv horse passport'],
                    horse.ueln!,
                    identityKey,
                    true,
                )

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

                console.log('result.tx type:', typeof result.tx)
                console.log('result.tx:', result.tx)

                return res.json({
                    tx: Buffer.from(result.tx!).toString('base64'), 
                    txid: result.txid,
                    outputIndex: 2
                })

            } catch (error) {
                console.error(error)
                return res.status(500).json({ error: 'Failed to create token' })
            }
        })
        
        app.listen(PORT, () => {
            console.log(`token-server is running on port ${PORT}`)
        })
    }

    init()

