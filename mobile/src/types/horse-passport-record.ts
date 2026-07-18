import type { HorsePassport } from "./horse-passport"

export type HorsePassportRecord = {
    horse: Partial<HorsePassport>,
    status: 'draft' | 'pending' | 'revision' | 'active' | 'inactive',
    createdAt: string,
    submittedAt?: string
    receivedAt?: string,
    issuedAt?: string,
    revisionComment?: string,
    ownerIdentityKey?: string
}   