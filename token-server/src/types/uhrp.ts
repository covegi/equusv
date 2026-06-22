export type UHRP {
    version: string,
    ueln: string,
    uhrpUrl: string,
    tokenType: string,
    mimeType: string,
    description?: string,
    createdAt: number,
    parentTxid: string,
    txid: string,
    outputIndex: number,
    spent?: boolean
}