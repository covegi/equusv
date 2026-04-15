import { StorageDownloader, ECIES, PrivateKey } from "@bsv/sdk"
import * as SecureStore from 'expo-secure-store'

export const fetchFromUhrp = async ({ uhrpUrl }: { uhrpUrl: string }): Promise<string> => {
    const downloader = new StorageDownloader({ networkPreset: 'mainnet' })

    const urls = await downloader.resolve(uhrpUrl)
    console.log('resolved urls:', urls)

    if (urls.length === 0) {
        console.log('No URLs resolved — propagation delay?')
        throw new Error('No one currently hosts this file!')
    }

    const response = await fetch(urls[0])
    console.log('fetch status:', response.status)
    const arrayBuffer = await response.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    console.log('downloaded bytes:', data.length)

    const rootKeyHex = await SecureStore.getItemAsync('rootKeyHex')
    const privateKey = PrivateKey.fromString(rootKeyHex!)
    const decrypted = ECIES.electrumDecrypt(Array.from(data), privateKey)

    const base64 = Buffer.from(decrypted).toString('base64')
    return `data:image/jpeg';base64,${base64}`
}