import 'express'

declare module 'express' {
    interface Request {
        auth?: {
            identityKey: string
        }
    }
} 