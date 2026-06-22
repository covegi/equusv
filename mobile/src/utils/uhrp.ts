import { StorageDownloader, ECIES, PrivateKey } from "@bsv/sdk"
import * as SecureStore from 'expo-secure-store'

export const fetchFromUhrp = async ({ cdnUrl, mimeType }: { cdnUrl: string, mimeType: string }): Promise<string | null> => {
    const STORAGE_BASE = 'https://nanostore.babbage.systems/cdn'
    const url = cdnUrl
    console.log('fetching from:', url)

    try {
        const response = await Promise.race([
            fetch(url),
            new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('UHRP timeout')), 10000)
            )
        ])

        console.log('fetch status:', response.status)
        if (!response.ok) return null

        const arrayBuffer = await response.arrayBuffer()
        const data = new Uint8Array(arrayBuffer)
        console.log('downloaded bytes:', data.length)

        const rootKeyHex = await SecureStore.getItemAsync('rootKeyHex')
        const privateKey = PrivateKey.fromString(rootKeyHex!)
        const decrypted = ECIES.electrumDecrypt(Array.from(data), privateKey)

        const base64 = Buffer.from(decrypted).toString('base64')
        return `data:${mimeType};base64,${base64}`
    } catch (error) {
        console.error(error)
        return null
    }
}

// export const fetchFromUhrp = async ({ uhrpUrl }: { uhrpUrl: string }): Promise<string | null> => {
//     const downloader = new StorageDownloader({ networkPreset: 'mainnet' })

//     const urls = await downloader.resolve(uhrpUrl)
//     console.log('resolved urls:', urls)

//     if (urls.length === 0) {
//         console.log('No URLs resolved — propagation delay?')
//         return null
//     }

//     const controller = new AbortController()
//     const timeout = setTimeout(() => controller.abort(), 15000)

//     try {
//         const response = await fetch(urls[0], { signal: controller.signal })
//         clearTimeout(timeout)
//         console.log('fetch status:', response.status)
//         const arrayBuffer = await response.arrayBuffer()
//         const data = new Uint8Array(arrayBuffer)
//         console.log('downloaded bytes:', data.length)

//         const rootKeyHex = await SecureStore.getItemAsync('rootKeyHex')
//         const privateKey = PrivateKey.fromString(rootKeyHex!)
//         const decrypted = ECIES.electrumDecrypt(Array.from(data), privateKey)

//         const base64 = Buffer.from(decrypted).toString('base64')
//         return `data:image/jpeg;base64,${base64}`
//     } catch (error) {
//         console.error(error)
//         clearTimeout(timeout)
//         return null
//     }
// }