// Deterministically serializes a field array (number[][]) into a single
// byte sequence (number[]) for hashing/signing.
//
// Format, per field, in order:
//   - 4-byte big-endian length prefix
//   - the field's bytes
//
// The length prefix makes field boundaries unambiguous, so signing and
// verification always hash the exact same bytes. Both sides MUST use this
// same function, or signatures won't verify.

export function serializeFields(fields: number[][]): number[] {
    const out: number[] = []

    for (const field of fields) {
        const len = field.length

        out.push((len >>> 24) & 0xff)
        out.push((len >>> 16) & 0xff)
        out.push((len >>> 8) & 0xff)
        out.push((len & 0xff))

        out.push(...field)
    }

    return out
}