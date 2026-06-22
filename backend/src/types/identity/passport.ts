export interface EquusVPassportRecord {
    version: string,
    name: string
    breed: string
    birthDate: string
    sex: string
    color: string
    ueln: string
    chip: string
    ownerAtRegistration: string
    location: string
    organisation: string
    issuedDate: string
    foodChainStatus: boolean
    txid: string,
    outputIndex: number
}

export interface UTXOReference {
    txid: string,
    outputIndex: number
}