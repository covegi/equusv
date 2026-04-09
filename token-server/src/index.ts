    import express from 'express'
    import type { NextFunction, Request, Response } from 'express'
    import dotenv from 'dotenv'
    import { Setup } from '@bsv/wallet-toolbox'
    import { StorageUploader } from '@bsv/sdk'
    import { createAuthMiddleware } from '@bsv/auth-express-middleware'

    dotenv.config()
    const app = express()
    const PORT = process.env.PORT ?? 3000
    app.use(express.json())
    app.use(express.text({ type: 'text/plain', limit: '10mb' }))

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

        app.post('/upload', async (req: Request, res: Response) => {
            const encryptedBuffer = Buffer.from(req.body, 'base64')
            if (!encryptedBuffer) {
                res.send('No encryptedBuffer received')
            }
    
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
                    return res.json(uploadFileResult.uhrpURL)
                }
            } catch (error) {
                console.error(error)
            }
        })

        app.listen(PORT, () => {
            console.log(`cert-server is running on port ${PORT}`)
        })
    }

    init()

