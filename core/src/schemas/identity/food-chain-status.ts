import type { Schema } from "../../types/schema.js"

export const foodChainStatus: Schema = {
    category: 'identity',
    subCategory: 'food-chain-status',
    version: 1,
    mode: 'status',
    fields: [
        {
            name: 'inFoodChain',
            label: 'Livsmedelskedjan',
            type: 'boolean',
            required: true,
            encrypted: false
        },
        {
            name: 'date',
            label: 'Datum',
            type: 'date',
            required: true,
            encrypted: false
        }
    ],
    signing: [],
    visibility: ['owner'],
    process: false
}