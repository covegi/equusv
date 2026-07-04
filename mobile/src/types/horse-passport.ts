export type HorsePassport = {
    version: string,
    id: string,
    name: string
    breed: string
    birthDate: string
    sex: string
    color: string
    ownerAtRegistration: string
    location: string
    foodChainStatus: boolean
    // external fields
    ueln?: string
    chip?: string
    organisation?: string
    issuedDate?: string
}