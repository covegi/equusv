import type { AdmittanceInstructions, TopicManager } from "@bsv/overlay"
import { Transaction, PushDrop, Utils } from '@bsv/sdk'
import { schemas } from '../_generated/index.js'
import equusVTokenTopicDocs from '../docs/EquusVTokenTopicDocs.md.js'

// Field contract for branches (must match buildFields in @equusv/core):
//   0 version | 1 uuid | 2 category | 3 subCategory | 4 createdAt | 5 anchorTxid | 6+ schema fields
//
// Anchor has a different fixed contract (no schema, no anchorTxid):
//   0 version | 1 uuid | 2 category | 3 subCategory | 4 createdAt | 5 issuerIdentityKey | 6 signature

const ENGINE_FIELD_COUNT = 6
const SUBCATEGORY_INDEX = 3

export default class EquusVTokenTopicManager implements TopicManager {

    async getDocumentation(): Promise<string> {
        return equusVTokenTopicDocs
    }

    async getMetaData(): Promise<{ name: string, shortDescription: string, iconURL?: string, version?: string, informationURL?: string }> {
        return {
            name: 'EquusV Token Protocol',
            shortDescription: 'Validates all EquusV Token-instances against their SubCategory schema',
            version: '0.1.0',
            informationURL: 'https://equusv.com'
        }
    }

    async identifyAdmissibleOutputs(
        beef: number[],
        previousCoins: number[]
    ): Promise<AdmittanceInstructions> {
        try {
            const outputs: number[] = []
            const tx = Transaction.fromBEEF(beef)

            for (const [i, output] of tx.outputs.entries()) {
                try {
                    const decoded = PushDrop.decode(output.lockingScript)
                    const fields = decoded.fields

                    const subCategory = Utils.toUTF8(fields[SUBCATEGORY_INDEX])

                    // Anchor: fixed contract, no schema.
                    if (subCategory === 'anchor') {
                        if (fields.length < 7) throw new Error('Anchor field count mismatch')
                        for (let n = 0; n < 7; n++) {
                            if (!fields[n].length) throw new Error(`Empty anchor field ${n}`)
                        }
                        outputs.push(i)
                        continue
                    }

                    // Branches: schema-driven.
                    const schema = schemas[subCategory]
                    if (!schema) {
                        throw new Error(`Unknown subCategory: ${subCategory}`)
                    }

                    const minimum = ENGINE_FIELD_COUNT + schema.fields.length
                    if (fields.length < minimum) throw new Error('Field count mismatch')

                    for (let n = 0; n < ENGINE_FIELD_COUNT; n++) {
                        if (!fields[n].length) throw new Error(`Empty engine field ${n}`)
                    }

                    schema.fields.forEach((field, k) => {
                        if (field.required && !fields[ENGINE_FIELD_COUNT + k].length) {
                            throw new Error(`Empty required field: ${field.name}`)
                        }
                    })

                    outputs.push(i)
                } catch (error) {
                    console.error('Rejected output', i, error)
                }
            }

            if (outputs.length === 0) {
                throw new Error('No valid EquusV token outputs in this transaction')
            }

            return {
                coinsToRetain: previousCoins,
                outputsToAdmit: outputs
            }
        } catch (error) {
            console.error('Admittance failed:', error)
            return {
                coinsToRetain: [],
                outputsToAdmit: []
            }
        }
    }
}