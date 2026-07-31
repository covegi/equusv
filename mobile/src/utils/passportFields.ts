/**
 * PASSPORT TOKEN FORMAT — VERSION 2
 *
 * Do NOT modify these functions when the field layout changes.
 * Every active token on-chain carries a signature over the exact bytes
 * produced by buildPassportFields + serializeFields. Changing either one
 * makes all existing v2 signatures unverifiable — permanently.
 *
 * For a new format: add buildPassportFieldsV3 / serializeFieldsV3 alongside
 * these, and dispatch on record.version at the call site.
 *
 * Field layout (18 fields, index 0-17):
 *   0  version              9  location
 *   1  status              10  foodChainStatus ('true' | 'false')
 *   2  id                  11  ueln
 *   3  name                12  chip
 *   4  breed               13  organisation
 *   5  birthDate           14  createdAt
 *   6  sex                 15  submittedAt
 *   7  color               16  issuedAt
 *   8  ownerAtRegistration 17  identityKey
 *
 * Approval tokens append three more fields at 18-20 (hash, signature,
 * certifierIdentityKey). Those are NOT part of the hashed payload.
 *
 * Serialization: each field is prefixed with its byte length as 4 bytes
 * big-endian, followed by the field bytes. Fields in index order.
 * Missing/undefined values serialize as empty strings.
 *
 * The token-server has an identical implementation in
 * src/utils/passportFields.ts. The two must stay in sync byte for byte,
 * or signature verification fails with no useful error.
 */

import { HorsePassportRecord } from "@/types/horse-passport-record"
import { Utils } from "@bsv/sdk"

export const serializeFields = (fields: number[][]): number[] => {
        const out: number[] = []
        for (const field of fields) {
            const len = field.length
            out.push((len >>> 24) & 0xff, (len >>> 16) & 0xff, (len >>> 8) & 0xff, len & 0xff)
            out.push(...field)
        }
        return out
    }

export const buildPassportFields = (record: HorsePassportRecord): number[][] => {
    const horse = record.horse

    const fields = [
        record.version,
        record.status,
        horse.id,
        horse.name,
        horse.breed,
        horse.birthDate,
        horse.sex,
        horse.color,
        horse.ownerAtRegistration,
        horse.location,
        (horse.foodChainStatus ?? false).toString(),
        horse.ueln,
        horse.chip,
        horse.organisation,
        record.createdAt,
        record.submittedAt,
        record.issuedAt,
        record.identityKey
    ].map(field => Utils.toArray(field ?? '', 'utf8'))

    if (fields.length !== 18) {
        throw new Error(`Expected 18 fields, got ${fields.length}`)
    }
    return fields
}