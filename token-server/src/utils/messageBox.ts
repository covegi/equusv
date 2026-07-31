import { MessageBoxClient } from "@bsv/message-box-client"
import type { WalletInterface } from '@bsv/sdk'

export const MESSAGEBOX_HOST = 'https://messagebox.babbage.systems'

export const MESSAGE_BOXES = {
    revisions: 'equusv_revisions',
    active: 'equusv_active',
} as const

export async function createMessageBoxClient(wallet: WalletInterface) {
    const client = new MessageBoxClient({
        walletClient: wallet,
        host: MESSAGEBOX_HOST
    })
    await client.init()
    return client
}