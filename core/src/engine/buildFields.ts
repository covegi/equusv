import { Utils } from '@bsv/sdk'
import type { Schema } from '../types/schema.js'

// Engine field values — the ones that don't come from the schema/form,
// but are set by the system at creation time.
type Meta = {
    uuid: string
    anchorTxid: string
    createdAt: string
}

// The actual data, keyed by field name.
// Ex: { inFoodChain: true, date: '2026-09-07' }
type Values = Record<string, unknown>

/**
 * Builds the PushDrop field array for a Token-instance, in the locked field contract:
 *
 *   0  version
 *   1  uuid
 *   2  category
 *   3  subCategory
 *   4  createdAt
 *   5  anchorTxid          (other Token-instances; the anchor does not have this)
 *   6+ schema fields        (in schema.fields order)
 *
 * Everything is stored as UTF-8 strings. The schema's type drives validation/rendering,
 * not the storage format.
 *
 * Returns number[][] — what PushDrop.lock expects.
 */
export function buildFields(schema: Schema, values: Values, meta: Meta): number[][] {

    const enc = (v: unknown): number[] => Utils.toArray(String(v), 'utf8')

    const fields: number[][] = [
        enc(schema.version),
        enc(meta.uuid),
        enc(schema.category),
        enc(schema.subCategory),
        enc(meta.createdAt),
        enc(meta.anchorTxid)
    ]

    // Schema fields, pos 6+. Loop schema.fields IN ORDER.
    //    Rules:
    //      - required + value missing  -> throw (do not build a broken token)
    //      - optional + value missing  -> empty string '' (KEEP the position, NEVER skip)
    //      - otherwise                 -> enc(value)
    //
    //    Why never skip: skipping a field shifts every following position,
    //    and validation/parsing will no longer line up.
    for (const field of schema.fields) {
        const value = values[field.name]    

        if (value === undefined || value === null) {
            if (field.required) {
                throw new Error(`Missing required field: ${field.name}`)
            }
            fields.push(enc(''))
        } else {
            fields.push(enc(value))
        }
    }

    return fields
}