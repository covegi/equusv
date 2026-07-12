export const CERT_TYPE_HORSE_OWNER = Buffer.from('equusv-horse-owner').toString('base64')
export const CERT_TYPE_BREEDING_ORG = Buffer.from('equusv-breeding-organisation').toString('base64')

export type RoleId = 'owner' | 'breedingOrg' 

export interface RoleDefinition {
    id: RoleId,
    label: string,
    certType: string
}

export const ROLES: RoleDefinition[] = [
    { id: 'owner', label: 'Hästägare', certType: CERT_TYPE_HORSE_OWNER },
    { id: 'breedingOrg', label: 'Avelsorganisation', certType: CERT_TYPE_BREEDING_ORG },
]