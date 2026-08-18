export interface EquusVUHRPRecord {
    version: string,
    id: string,
    uhrpUrl: string,
    tokenType: string,
    mimeType: string,
    description?: string,
    createdAt: string,
    parentTxid: string,
    txid: string,
    outputIndex: number,
    spent?: boolean
}

export interface UTXOReference {
    txid: string,
    outputIndex: number
}