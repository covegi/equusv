import { LookupResolver, Transaction, PushDrop, Utils, MasterCertificate, VerifiableCertificate, PrivateKey, ProtoWallet } from "@bsv/sdk"

const OVERLAY_URL = process.env.EXPO_PUBLIC_OVERLAY_URL

export async function discoverIdentity(identityKey: string) {
    console.log('OVERLAY_URL:', OVERLAY_URL)
    const resolver = new LookupResolver({
        networkPreset: 'mainnet',
        hostOverrides: { ls_identity: [OVERLAY_URL!]}
    })
    console.log('resolver created')

    const answer = await resolver.query({
        service: 'ls_identity',
        query: { subject: identityKey }
    })

    if (answer.type !== 'output-list') return []

    const certs = await Promise.all(answer.outputs.map( async ({ beef, outputIndex }) => {
        const tx = Transaction.fromBEEF(beef)
        const decoded = PushDrop.decode(tx.outputs[outputIndex].lockingScript)
        const cert = JSON.parse(Utils.toUTF8(decoded.fields[0]))

        const verifiableCert = new VerifiableCertificate(
            cert.type,
            cert.serialNumber,
            cert.subject,
            cert.certifier,
            cert.revocationOutpoint,
            cert.fields,
            cert.keyring,
            cert.signature
        )
        const decryptedFields = await verifiableCert.decryptFields(
            new ProtoWallet(new PrivateKey(1))
        )
        return { ...cert, decryptedFields}
    }))

    console.log('discovered certs:', JSON.stringify(certs))
    return certs
}


