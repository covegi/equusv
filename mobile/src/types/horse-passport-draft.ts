import type { HorsePassport } from "./horse-passport"

export type HorsePassportDraft = {
    horse: HorsePassport,
    status: 'draft' | 'pending' | 'revision' | 'approved',
    createdAt: string
}