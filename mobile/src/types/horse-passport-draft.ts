import type { HorsePassport } from "./horse-passport"

export type HorsePassportDraft = {
    horse: Partial<HorsePassport>,
    status: 'draft' | 'pending' | 'revision' | 'approved' | 'active',
    createdAt: string
}   