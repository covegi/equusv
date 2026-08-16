import { LookupResolver, Transaction, PushDrop, Utils, MasterCertificate, VerifiableCertificate, PrivateKey, ProtoWallet } from "@bsv/sdk"

const OVERLAY_URL = process.env.EXPO_PUBLIC_OVERLAY_URL

export async function discoverIdentity(identityKey: string) {
    console.log('OVERLAY_URL:', OVERLAY_URL)
    const resolver = new LookupResolver({
        networkPreset: 'local',
        hostOverrides: { ls_identity: [OVERLAY_URL!]}
    })
    console.log('resolver created')

    for (let i = 0; i < 5; i++) {
        try {
            const answer = await resolver.query({
                service: 'ls_identity',
                query: { subject: identityKey }
            })
            console.log('ANSWER:', answer.type, answer.type === 'output-list' ? answer.outputs.length : answer)

            if (answer.type === 'output-list' && answer.outputs.length > 0) {
                    const certs = await Promise.all(answer.outputs.map(async ({ beef, outputIndex }) => {
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
                        return { ...cert, decryptedFields }
                    }))
                    return certs
                }
            } catch (error) {
                console.log('DISCOVERY THREW:', error)
            }
            await new Promise(r => setTimeout(r, 2500))
        }
        return []
    }
    

    
