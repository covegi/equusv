import type { HorsePassport } from "./horse-passport"

export const PASSPORT_STATUSES = ['draft', 'pending', 'revision', 'active', 'inactive'] as const
export type PassportStatus = typeof PASSPORT_STATUSES[number]

export const isPassportStatus = (v: string): v is PassportStatus => 
    (PASSPORT_STATUSES as readonly string[]).includes(v)

export type HorsePassportRecord = {
    horse: Partial<HorsePassport>,
    version?: string,
    status: PassportStatus,
    createdAt: string,
    submittedAt?: string
    issuedAt?: string,
    revisionComment?: string,
    identityKey?: string,
}

export type ApprovalPayload = {
    hash: string,
    signature: string,
    certifierIdentityKey: string
}