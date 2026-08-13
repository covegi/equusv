import type { AdmittanceInstructions, TopicManager } from "@bsv/overlay"
import { Transaction, PushDrop, Utils } from "@bsv/sdk"
import equusvIdentityTopicDocsMd from '../../docs/credentials/EquusVIdentityTopicDocs.md.js'

export default class EquusVIdentityTopicManager implements TopicManager {
    async getDocumentation(): Promise<string>{
        return equusvIdentityTopicDocsMd
    }

    async getMetaData(): Promise<{ name: string, shortDescription: string, iconURL?: string, version?: string, informationUrl?: string }> {
        return {
            name: 'EquusV Identity Protocol',
            shortDescription: 'Manages identity certificate tokens for the EquusV platform',
            version: '0.1.0',
            informationUrl: 'https://equusv.com'
        }
    }

    async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> {
        console.log('IDENTITY topic manager ENTERED')
        try {
            const outputs: number[] = []
            const parsedTransaction = Transaction.fromBEEF(beef)

            for (const [i, output] of parsedTransaction.outputs.entries()) {
                try {
                    const decoded = PushDrop.decode(output.lockingScript)
                    if (!decoded.fields[0]?.length) throw new Error('Identity cert payload cannot be empty')
                    
                    const json = Utils.toUTF8(decoded.fields[0])
                    const cert = JSON.parse(json)
                    if (!cert.type || !cert.subject || !cert.certifier || !cert.signature) {
                        throw new Error('Malformed identity certificate')
                    }
                    outputs.push(i) 
                    console.log('output', i, 'ADMITTED')
                } catch (error: any) {
                    console.error('output', i, 'REJECTED:', error.message)
                }
            }

            console.log('final outputsToAdmit:', outputs)

            if (outputs.length === 0) {
                throw new Error('No valid EquusV identity token in transaction')
            }

            return { coinsToRetain: previousCoins, outputsToAdmit: outputs }
        } catch (error: any) {
            console.error('Admittance failed:', error.message)
            return { coinsToRetain: [], outputsToAdmit: [] }
        }
    }
}