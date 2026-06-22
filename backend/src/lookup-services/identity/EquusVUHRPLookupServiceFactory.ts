import type { AdmissionMode, LookupService, OutputAdmittedByTopic, OutputSpent, SpendNotificationMode } from "@bsv/overlay"
import { PushDrop, Utils, LockingScript } from '@bsv/sdk'
import type { EquusVUHRPRecord, UTXOReference } from "../../types/identity/uhrp.js"
import equusVUHRPLookupServiceDocsMd from "../../docs/identity/EquusVUHRPLookupServiceDocs.md.js"
import { Db, Collection } from "mongodb"

class EquusVUHRPLookupService implements LookupService {
    readonly admissionMode: AdmissionMode = 'locking-script'
    readonly spendNotificationMode: SpendNotificationMode = 'txid'
    records: Collection<EquusVUHRPRecord> 

    constructor(db: Db) {
        this.records = db.collection<EquusVUHRPRecord>('uhrp_records')
    }

    async getDocumentation(): Promise<string> {
        return equusVUHRPLookupServiceDocsMd
    }

    async getMetaData(): Promise<{ name: string, shortDescription: string, iconURL?: string, version?: string, informationUrl?: string}> {
        return {
            name: 'EquusV Identity UHRP Lookup Service',
            shortDescription: 'Query UHRP file tokens by UELN, token type or parent transaction ID',
            version: '0.1.0',
            informationUrl: 'https://www.equusv.com'
        }
    }

    async outputAdmittedByTopic(payload: OutputAdmittedByTopic) {
        if (payload.mode !== 'locking-script') {
            throw new Error('Invalid payload')
        }
        const { topic, txid, outputIndex, lockingScript } = payload
        if (topic !== 'tm_uhrp') return

        const ls = LockingScript.fromHex(lockingScript.toHex())
        const decoded = PushDrop.decode(ls)

        await this.records.insertOne({
            txid,
            outputIndex,
            version: Utils.toUTF8(decoded.fields[0]),
            ueln: Utils.toUTF8(decoded.fields[1]),
            uhrpUrl: Utils.toUTF8(decoded.fields[2]),
            tokenType: Utils.toUTF8(decoded.fields[3]),
            mimeType: Utils.toUTF8(decoded.fields[4]),
            description: Utils.toUTF8(decoded.fields[5]),
            createdAt: Utils.toUTF8(decoded.fields[6]),
            parentTxid: Utils.toUTF8(decoded.fields[7])
        })
        console.log(`UHRP indexed: ${Utils.toUTF8(decoded.fields[1])}`)
        console.log('Inserted record ueln:', Utils.toUTF8(decoded.fields[1]), 'tokenType:', Utils.toUTF8(decoded.fields[3]))
    }

    async outputSpent(payload: OutputSpent) {
        if (payload.mode !== 'txid') throw new Error('Payload invalid')
        const { txid, topic, outputIndex} = payload
        if (topic !== 'tm_uhrp') return 
        
        await this.records.updateOne(
            { txid, outputIndex },
            { $set: { spent: true }}
        )
    }

    async outputEvicted(txid: string, outputIndex: number) {
        await this.records.deleteOne({ txid, outputIndex })
    }

    async lookup(params: any): Promise<UTXOReference[]> {
        const query = params.query ?? params

        if (!query || Object.keys(query).length === 0) {
            throw new Error('Please enter a valid query')
        }

        let filter: any = {}
        if (query.ueln) filter.ueln = query.ueln
        if (query.tokenType) filter.tokenType = query.tokenType
        if (query.parentTxid) filter.parentTxid = query.parentTxid
        
        const results = await this.records.find(filter).sort({ createdAt: -1 }).toArray()
        console.log('MongoDB results:', JSON.stringify(results, null, 2))
        if (results.length > 0) {
            console.log(`Query commitment: ${results}`)
        }

        return results.map(result => (
            {
                txid: result.txid,
                outputIndex: result.outputIndex
            }
        ))
    }
}

export default (db: Db) => {
    const service = new EquusVUHRPLookupService(db)
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