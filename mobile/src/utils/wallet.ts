import { generateMnemonic, mnemonicToSeed, mnemonicToSeedSync } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { HDKey } from '@scure/bip32'
import { PrivateKey, CachedKeyDeriver } from '@bsv/sdk'
import {
    Wallet,
    Services,
    WalletStorageManager,
    StorageClient,
    type Wallet as WalletType
} from '@bsv/wallet-toolbox/out/src/index.mobile'
import * as SecureStore from 'expo-secure-store'

export async function generateKey(): Promise<{ mnemonic: string, rootKeyHex: string}> {
    const mnemonic = generateMnemonic(wordlist)
    const seed = mnemonicToSeedSync(mnemonic)
    const root = HDKey.fromMasterSeed(seed)
    const rootKeyHex = Buffer.from(root.privateKey!).toString('hex')
    
    return { mnemonic, rootKeyHex }
}

export async function storeKey(rootKeyHex: string): Promise<void> {
    await SecureStore.setItemAsync('rootKeyHex', rootKeyHex)
}

export async function loadWallet(): Promise<Wallet | null> {
    const rootKeyHex = await SecureStore.getItemAsync('rootKeyHex')
    if (!rootKeyHex) return null

    const chain = 'main'
    const endpointUrl = process.env.EXPO_PUBLIC_STORAGE ?? 'https://staging-storage.babbage.systems'

    const rootKey = PrivateKey.fromHex(rootKeyHex)
    // Todo: Type conflict due to duplicate @bsv/sdk instances (global vs local)
    // CachedKeyDeriver is compatible at runtime but TypeScript sees two separate declarations
    const keyDeriver = new CachedKeyDeriver(rootKey) as any
    const storage = new WalletStorageManager(keyDeriver.identityKey)
    const services = new Services(chain)
    const wallet = new Wallet({ chain, keyDeriver, storage, services })
    const client = new StorageClient(wallet, endpointUrl)
    await storage.addWalletStorageProvider(client)
    await storage.makeAvailable()
    
    return wallet
} 

export async function restoreWallet(mnemonic: string[]): Promise<Wallet | null > {
    try {
        const enteredMnemonic = mnemonic.map(word => word.trim()).join(' ')
        const seed = mnemonicToSeedSync(enteredMnemonic )
        const root = HDKey.fromMasterSeed(seed)
        const rootKeyHex = Buffer.from (root.privateKey!).toString('hex')

        const chain = 'main'
        const endpointUrl = process.env.EXPO_PUBLIC_STORAGE ?? 'https://staging-storage.babbage.systems'

        const rootKey = PrivateKey.fromHex(rootKeyHex)
        // Todo: Type conflict due to duplicate @bsv/sdk instances (global vs local)
        // CachedKeyDeriver is compatible at runtime but TypeScript sees two separate declarations
        const keyDeriver = new CachedKeyDeriver(rootKey) as any
        const storage = new WalletStorageManager(keyDeriver.identityKey)
        const services = new Services(chain)
        const wallet = new Wallet({ chain, keyDeriver, storage, services })
        const client = new StorageClient(wallet, endpointUrl)
        await storage.addWalletStorageProvider(client)
        await storage.makeAvailable()
        await SecureStore.setItemAsync('rootKeyHex', rootKeyHex)

        console.log('WALLET:', wallet)
        
        return wallet

    } catch (error) {
        console.log('restoreWallet error', error)
        return null
    }
}