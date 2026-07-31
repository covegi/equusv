import { MessageBoxClient } from "@bsv/message-box-client"
import type { Wallet } from '@bsv/wallet-toolbox'

export const MESSAGEBOX_HOST = 'https://messagebox.babbage.systems'

export const MESSAGE_BOXES = {
    revisions: 'equusv_revisions',
    active: 'equusv_active'
} as const

export async function createMessageBoxClient(wallet: Wallet) {
    const client = new MessageBoxClient({
        walletClient: wallet,
        host: MESSAGEBOX_HOST
    })
    await client.init()
    return client
}