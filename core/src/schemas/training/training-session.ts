import type { Schema } from '../../types/schema.js'

export const trainingSession: Schema = {
    category: 'training',
    subCategory: 'training-session',
    version: 1,
    mode: 'event',
    fields: [
        {
            name: 'date',
            label: 'Datum',
            type: 'date',
            required: true,
            encrypted: false
        },
        {
            name: 'trainingType',
            label: 'Typ',
            type: 'string',
            required: true,
            encrypted: false
        },
        {
            name: 'notes',
            label: 'Noteringar',
            type: 'string',
            required: false,
            encrypted: false
        }
    ],
    signing: [],
    visibility: ['owner'],
    process: false
}