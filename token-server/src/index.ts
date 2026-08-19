    import express from 'express'
    import type { NextFunction, Request, Response } from 'express'
    import dotenv from 'dotenv'
    import { Setup } from '@bsv/wallet-toolbox'
    import { PrivateKey, Hash } from '@bsv/sdk'
    import { createAuthMiddleware } from '@bsv/auth-express-middleware'
    import { PeerPayClient } from '@bsv/message-box-client'
    import passportRouter from './routes/identity/passport.js'
    import uhrpRouter from './routes/identity/uhrp.js'
    import spendRouter from './routes/admin.js'
    import horseOwnerCertificate from './routes/certify/horse-owner.js'
    import horseBreederCertificate from './routes/certify/breeding-organisation.js'
    import identityPublish from './routes/identity/publish.js'
    import identityKey from './utils/identityKey.js'

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

        // list and abort all stuck nosend transaction
        const { actions } = await wallet.listActions({
            labels: ['_specOpNoSendActions' as any, 'abort'],
            labelQueryMode: 'any'
        })
        console.log('Aborted nosend actions:', actions.length)

        console.log('Token-server identityKey:', wallet.identityKey)

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

        app.use(corsMiddleware)
        app.use(authMiddleware)

        app.use('/', passportRouter(wallet))
        app.use('/', uhrpRouter(wallet))

        app.use('/', horseOwnerCertificate(wallet))
        app.use('/', horseBreederCertificate(wallet))
        app.use('/', identityPublish(wallet))

        app.use(spendRouter(wallet))
    
        app.use('/', identityKey(wallet))
       
        
        app.listen(PORT, async () => {
            console.log(`token-server is running on port ${PORT}`)
        })
        
        // const client = new PeerPayClient({
        //         walletClient: wallet, 
        //         messageBoxHost: 'https://messagebox.babbage.systems'
        // })

    // const pollMessages = async () => {
    //     while (true) {
    //         try {
    //             const messages = await client.listMessages({
    //                 messageBox: 'equusv-passport-certification'
    //             })
    //             for (const message of messages) {
    //                 console.log('Inkommande passansökan från:', message.sender)
                    
    //                 const draft = typeof message.body === 'string'
    //                 ? JSON.parse(message.body)
    //                 : message.body

    //                 console.log('Draft mottagen:', JSON.stringify(draft))

    //                 if (draft.action === 'revoke') {
    //                     console.log('Återkallelse mottagen för:', draft.ueln)
    //                     await client.acknowledgeMessage({ messageIds: [message.messageId]})
    //                     continue
    //                 }

    //                 await new Promise(resolve => setTimeout(resolve, 5000))

    //                 const pending = await client.listMessages({ messageBox: 'equusv-passport-certification' })
    //                 const revoked = pending.some(m => {
    //                     const body = typeof m.body === 'string' ? JSON.parse(m.body) : m.body
    //                     return body.action === 'revoke' && body.ueln === draft.horse.ueln
    //                 }) 

    //                 if (revoked) {
    //                     console.log('Återkallad – skickar inte svar')
    //                     await client.acknowledgeMessage({ messageIds: [message.messageId]})
    //                     continue
    //                 }

    //                 const draftString = JSON.stringify(draft)
    //                 const draftBytes = Array.from(Buffer.from(draftString, 'utf-8'))
    //                 console.log('Hashar draft...')
    //                 const messageHash = Hash.sha256(draftBytes)

    //                 console.log('Signerar...')
    //                 const privateKey = PrivateKey.fromString(EQUUS_ROOT_KEY!)
    //                 const signature = privateKey.sign(messageHash)

    //                 console.log('Skickar svar till:', message.sender)

    //                 await Promise.all([
    //                     client.sendMessage({
    //                         recipient: message.sender,
    //                         messageBox: 'equusv-passport-certification-response',
    //                         body: JSON.stringify({ messageHash, signature, ueln: draft.horse.ueln })
    //                     }),
    //                     client.acknowledgeMessage({ messageIds: [message.messageId] })
    //                 ])
    //                 console.log('Svar skickat och acknowledged')
    //             }
    //         } catch (error) {
    //             console.error(error)
    //         }
    //         await new Promise(resolve => setTimeout(resolve, 3000))
    //     }
    // }
    // pollMessages()
    // console.log('Lyssnare aktiv')
        
    }

    init()

