import type { AdmittanceInstructions, TopicManager } from '@bsv/overlay'
import { Transaction, PushDrop } from '@bsv/sdk'
import equusVPassportTopicDocsMd from '../../docs/identity/EquusVPassportTopicDocs.md.js'

export default class EquusVHorsePassportTopicManager implements TopicManager {
    async getDocumentation(): Promise<string> {
        return equusVPassportTopicDocsMd
    }

    async getMetaData(): Promise<{ name: string, shortDescription: string, iconURL?: string, version?: string, informationURL?: string}> {
        return {
            name: 'EquusV Identity Passport Protocol',
            shortDescription: 'Manages horse passport tokens for EquusV platform',
            version: '0.1.0',
            informationURL: 'https://equusv.com'
        }
    }

    async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> {
        try {
            const outputs: number[] = []
            const parsedTransaction = Transaction.fromBEEF(beef)

            for (const [i, output] of parsedTransaction.outputs.entries()) {
                try {
                    const decoded = PushDrop.decode(output.lockingScript)

                    if (!decoded.fields[0].length) throw new Error('Version cannot be empty')

                    if (!decoded.fields[1].length) throw new Error('Status cannot be empty')
    
                    if (!decoded.fields[2].length) throw new Error('ID cannot be empty')
    
                    if (!decoded.fields[3].length) throw new Error('Name cannot be empty')
    
                    if (!decoded.fields[4].length) throw new Error('Breed cannot be empty')
    
                    if (!decoded.fields[5].length) throw new Error('BirthDate cannot be empty')
    
                    if (!decoded.fields[6].length) throw new Error('Sex cannot be empty')
    
                    if (!decoded.fields[7].length) throw new Error('Color cannot be empty')
    
                    if (!decoded.fields[8].length) throw new Error('OwnerAtRegistration cannot be empty')
    
                    if (!decoded.fields[9].length) throw new Error('Location cannot be empty')
    
                    if (!decoded.fields[10].length) throw new Error('FoodChainStatus cannot be empty')

                    if (!decoded.fields[17].length) throw new Error('IdentityKey cannot be empty')
                    
                    outputs.push(i)

                } catch (error) {
                    console.error('Error with output', i, error)
                }
            }

            if (outputs.length === 0) {
                throw new Error('This transaction does not publish a valid EquusV horse passport token!')
            }

            return {
                coinsToRetain: previousCoins,
                outputsToAdmit: outputs
            }

        } catch (error: any) {
            console.error('Admittance failed:', error.message)
            return {
                coinsToRetain: [],
                outputsToAdmit: []
            }
        }
    }
}