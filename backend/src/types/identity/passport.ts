export interface EquusVPassportRecord {
    txid: string,
    outputIndex: number,
    version: string,
    status: string,
    id: string,
    name: string
    breed: string
    birthDate: string
    sex: string
    color: string
    ownerAtRegistration: string
    location: string
    foodChainStatus: boolean
    ueln?: string
    chip?: string
    organisation?: string
    createdAt: string,
    submittedAt?: string,
    issuedAt?: string,
    identityKey: string,
}

export interface UTXOReference {
    txid: string,
    outputIndex: number
}

export type ApprovalPayload = {
    hash?: string,
    signature: string,
    certifierIdentityKey?: string
}