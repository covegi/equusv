import type { HorsePassport } from "./horse-passport"

export type HorsePassportRecord = {
    horse: Partial<HorsePassport>,
    status: 'draft' | 'pending' | 'revision' | 'active' | 'inactive',
    createdAt: string
}   