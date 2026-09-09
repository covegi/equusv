import { Utils } from '@bsv/sdk'

// The anchor's field contract (fields 0-5). Field 6 (signature) is appended
// by the route AFTER signing the hash of these fields — not built here.
//
//   0  version
//   1  uuid
//   2  category            (always 'anchor')
//   3  subCategory         (always 'anchor')
//   4  createdAt
//   5  issuerIdentityKey   (EquusV's public key)
//   6  signature           <- appended in the route, not here
//
// Note: the anchor has NO anchorTxid field — it IS the txid.
// This differs from buildFields (branches), which has anchorTxid at pos 5.

const VERSION = 1
const ANCHOR = 'anchor'

type AnchorMeta = {
    uuid: string,
    createdAt: string,
    issuerIdentityKey: string
}

export function buildAnchorFields(meta: AnchorMeta): number[][] {

    const enc = (v: unknown): number[] => Utils.toArray(String(v), 'utf8')

    const fields: number[][] = [
        enc(VERSION),
        enc(meta.uuid),
        enc(ANCHOR),
        enc(ANCHOR),
        enc(meta.createdAt),
        enc(meta.issuerIdentityKey),
    ]

    return fields
}