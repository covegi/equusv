import * as bip39 from 'bip39'
import { BIP32Factory } from 'bip32'
import * as ecc from 'tiny-secp256k1'
import * as SecureStore from 'expo-secure-store'
import { SetupClient } from '@bsv/wallet-toolbox'

const bip32 = BIP32Factory(ecc)

export async function generateAndStoreKey(): Promise<string> {
    const mnemonic = bip39.generateMnemonic()
    const seed = await bip39.mnemonicToSeed(mnemonic)
    const root = bip32.fromSeed(seed)
    const rootKeyHex = Buffer.from(root.privateKey!).toString('hex')
    await SecureStore.setItemAsync('rootKeyHex', rootKeyHex)
    return mnemonic
}

export async function loadWallet() {
    const rootKeyHex = await SecureStore.getItemAsync('rootKeyHex')
    if (!rootKeyHex) return null
    const wallet = await SetupClient.createWalletClientNoEnv({
        chain: 'test',
        rootKeyHex: rootKeyHex,
        storageUrl: process.env.EXPO_PUBLIC_STORAGE_URL
    })
    return wallet
}