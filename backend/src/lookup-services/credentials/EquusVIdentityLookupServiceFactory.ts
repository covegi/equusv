import type { AdmissionMode, LookupService, OutputAdmittedByTopic, OutputSpent, SpendNotificationMode } from '@bsv/overlay'
import { PushDrop, Utils, LockingScript } from '@bsv/sdk'
import type { EquusVIdentityRecord, UTXOReference } from '../../types/credentials/identity.js'
import equusVIdentityLookupServiceDocsMd from '../../docs/credentials/EquusVIdentityLookupServiceDocs.md.js'
import { Db, Collection } from 'mongodb'

class EquusVIdentityLookupService implements LookupService {
    readonly admissionMode: AdmissionMode = 'locking-script'
    readonly spendNotificationMode: SpendNotificationMode = 'txid'
    records: Collection<EquusVIdentityRecord>

    constructor(db:Db) {
        this.records = db.collection<EquusVIdentityRecord>('identity_records')
    }

    async getDocumentation(): Promise<string> {
        return equusVIdentityLookupServiceDocsMd
    }

    async getMetaData(): Promise<{ name: string, shortDescription: string, iconURL?: string, version?: string, informationURL: string }> {
        return {
            name: 'EquusV Identity Lookup Service',
            shortDescription: 'Query identity certificate tokens by subject identity key',
            version: '0.1.0',
            informationURL: 'https://www.equusv.com'
        }
    }

    async outputAdmittedByTopic(payload: OutputAdmittedByTopic) {
        if (payload.mode !== 'locking-script') throw new Error('Invalid payload')
        const { topic, txid, outputIndex, lockingScript } = payload
        if (topic !== 'tm_identity') return

        const ls = LockingScript.fromHex(lockingScript.toHex())
        const decoded = PushDrop.decode(ls)
        const cert = JSON.parse(Utils.toUTF8(decoded.fields[0]))

        await this.records.insertOne({
            txid, 
            outputIndex,
            subject: cert.subject,
            certifier: cert.certifier,
            type: cert.type,
            serialNumber: cert.serialNumber
        })
        console.log(`Identity cert indexed: ${cert.subject}`)
    }

    async outputSpent(payload: OutputSpent) {
        if (payload.mode !== 'txid') throw new Error('Invalid payload')
        const { txid, topic, outputIndex } = payload
        if (topic !== 'tm_identity') return

        await this.records.deleteOne({ txid, outputIndex })
    }

    async outputEvicted(txid: string, outputIndex: number) {
        await this.records.deleteOne({ txid, outputIndex })
    }

    async lookup(params: any): Promise<UTXOReference[]> {
        const query = params.query ?? params
        console.log('lookup query:', JSON.stringify(query))
        if (!query || Object.keys(query).length === 0) {
            throw new Error('Please enter a valid query.')
        }

        let filter: any = {}
        if (query.subject) filter.subject = query.subject
        if (query.certifier) filter.certifier = query.certifier
        if (query.serialNumber) filter.serialNumber = query.serialNumber

        const results = await this.records.find(filter).toArray()
        return results.map(result => ({
            txid: result.txid,
            outputIndex: result.outputIndex
        })) 
    }
}

export default (db: Db) => {
    const service = new EquusVIdentityLookupService(db)
    return {
        admissionMode: 'locking-script',
        spendNotificationMode: 'txid',
        getDocumentation: service.getDocumentation.bind(service),
        getMetaData: service.getMetaData.bind(service),
        outputEvicted: service.outputEvicted.bind(service),
        outputAdmittedByTopic: service.outputAdmittedByTopic.bind(service),
        outputSpent: service.outputSpent.bind(service),
        lookup: service.lookup.bind(service)
    }
}

