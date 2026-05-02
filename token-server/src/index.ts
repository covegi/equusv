    import express from 'express'
    import type { NextFunction, Request, Response } from 'express'
    import dotenv from 'dotenv'
    import { Setup } from '@bsv/wallet-toolbox'
    import { createAuthMiddleware } from '@bsv/auth-express-middleware'
    import passportRouter from './routes/identity/passport.js'
    import horseOwnerCertificate from './routes/certify/horse-owner.js'
    import horseBreederCertificate from './routes/certify/breeding-organisation.js'
    import identityKey from './routes/utils/identityKey.js'
    import connectDB from './db.js'

    dotenv.config()
    const app = express()
    const PORT = process.env.PORT ?? 3000
    app.use(express.json({ limit: '10mb' }))

    const init = async () => {
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

        const authMiddleware = createAuthMiddleware({
            wallet: wallet,
            allowUnauthenticated: false
        })

        await connectDB()

        app.use(corsMiddleware)
        app.use(authMiddleware)

       app.use('/', passportRouter(wallet))

       app.use('/', horseOwnerCertificate(wallet))
       app.use('/', horseBreederCertificate(wallet))
    
       app.use('/', identityKey(wallet))
       
        
        app.listen(PORT, () => {
            console.log(`token-server is running on port ${PORT}`)
        })
    }

    init()

