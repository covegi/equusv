    import express from 'express'
    import type { NextFunction, Request, Response } from 'express'
    import dotenv from 'dotenv'
    import { Setup } from '@bsv/wallet-toolbox'
    import { StorageUploader } from '@bsv/sdk'
    import { createAuthMiddleware } from '@bsv/auth-express-middleware'

    const app = express()
    const PORT = process.env.PORT ?? 3000
    app.use(express.json())

    const init = async () => {
        dotenv.config()
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
                'x-bsv-auth-requested-certificates'
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
                'x-bsv-auth-requested-certificates'
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

        app.post('/upload', express.raw({ type: 'application/octet-stream', limit: '10mb' }), async (req: Request, res: Response) => {
            const encryptedBuffer = req.body
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

