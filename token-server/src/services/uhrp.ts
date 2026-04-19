import { StorageUploader } from "@bsv/sdk"
import type { WalletInterface } from '@bsv/sdk'

const STORAGE_URL = process.env.STORAGE_URL

 export const uploadToUhrp = async (base64body: string, wallet: WalletInterface): Promise<string | undefined> => {
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