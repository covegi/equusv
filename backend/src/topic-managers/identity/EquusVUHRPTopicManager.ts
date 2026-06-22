import type { AdmittanceInstructions, TopicManager } from '@bsv/overlay'
import { Transaction, PushDrop } from '@bsv/sdk'
import equusVUHRPTopicDocsMd from '../../docs/identity/EquusVUHRPTopicDocs.md.js'

export default class EquusVUHRPTopicManager implements TopicManager {
    async getDocumentation(): Promise<string> {
        return equusVUHRPTopicDocsMd
    }

    async getMetaData(): Promise<{ name: string, shortDescription: string, iconURL?: string, version: string, informationURL?: string }> {
        return {
            name: 'EquusV Identity UHRP Protocol',
            shortDescription: 'Manages UHRP file tokens linking media assets to horse records via UELN',
            version: '0.1.0',
            informationURL: 'https://equusv.com'
        }
    }

    async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> {
        try {
            console.log('BEEF magic bytes (hex)', Buffer.from(beef.slice(0, 6)).toString('hex'))
            console.log('BEEF total length:', beef.length)

            const outputs: number[] = []
            const parsedTransaction = Transaction.fromBEEF(beef)

            for (const [i, output] of parsedTransaction.outputs.entries()) {
                try {
                    const decoded = PushDrop.decode(output.lockingScript)

                    if (!decoded.fields[0].length) {
                        throw new Error('Version number cannot be empty')
                    }

                    if (!decoded.fields[1].length) {
                        throw new Error('ueln cannot be empty')
                    }

                    if (!decoded.fields[2].length) {
                        throw new Error('uhrpUrl cannot be empty')
                    }

                    if (!decoded.fields[3].length) {
                        throw new Error('tokenType cannot be empty')
                    }

                    if (!decoded.fields[4].length) {
                        throw new Error('mimeType cannot be empty')
                    }

                    outputs.push(i)

                } catch (error) {
                    // console.error('Error with output', i, output)
                    console.error(`Output ${i} skipped:`, (error as Error).message)
                }
            }

            if (outputs.length === 0) {
                throw new Error('This transaction does not publish a valid EquusV UHRP token!')
            }

            return {
                coinsToRetain: previousCoins,
                outputsToAdmit: outputs
            }
        } catch (error) {
            // console.log('Admittance failed')
            console.error('Admittance failed:', (error as Error).message, (error as Error).stack)
            return {
                coinsToRetain: [],
                outputsToAdmit: []
            }
        }
    }

}