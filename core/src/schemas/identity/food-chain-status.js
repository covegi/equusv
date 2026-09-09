"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.foodChainStatus = void 0;
exports.foodChainStatus = {
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
};
