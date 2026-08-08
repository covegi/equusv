export interface EquusVIdentityRecord {
    txid: string,
    outputIndex: number,
    subject: string,
    certifier: string,
    type: string,
    serialNumber: string
}

export interface UTXOReference {
    txid: string,
    outputIndex: number
}