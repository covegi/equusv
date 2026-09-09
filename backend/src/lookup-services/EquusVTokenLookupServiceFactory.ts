import type { AdmissionMode, LookupService, OutputAdmittedByTopic, OutputSpent, SpendNotificationMode } from '@bsv/overlay'
import { PushDrop, Utils, LockingScript } from '@bsv/sdk'
import { schemas } from '../_generated/index.js'
import { Db, Collection } from 'mongodb'
import equusvTokenLookupService from '../docs/EquusVTokenLookupServiceDocs.md.js'

// Field contract (must match buildFields in @equusv/core):
//   0 version | 1 uuid | 2 category | 3 subCategory | 4 createdAt | 5 anchorTxid | 6+ schema fields
const ENGINE_FIELD_COUNT = 6

const TOPIC = 'tm_equusv'

// Mongo record. Engine fields are always indexed; schema fields marked
// indexed:true in their schema are added dynamically. `current` = latest
// version (false once superseded — history is preserved, never deleted).
type TokenRecord = {
    txid: string
    outputIndex: number
    version: string
    uuid: string
    category: string
    subCategory: string
    createdAt: string
    anchorTxid: string
    current: boolean
    [key: string]: unknown        // indexed schema fields
}

type UTXOReference = { txid: string, outputIndex: number }

class EquusVTokenLookupService implements LookupService {
    readonly admissionMode: AdmissionMode = 'locking-script'
    readonly spendNotificationMode: SpendNotificationMode = 'txid'
    records: Collection<TokenRecord>

    constructor(db: Db) {
        this.records = db.collection<TokenRecord>('equusv_token_records')
    }

    async getDocumentation(): Promise<string> {
        return equusvTokenLookupService
    }

    async getMetaData(): Promise<{ name: string, shortDescription: string, iconURL?: string, version?: string, informationURL: string }> {
        return {
            name: 'EquusV Token Lookup Service',
            shortDescription: 'Query EquusV Token-instances by anchor, category, subCategory',
            version: '0.1.0',
            informationURL: 'https://www.equusv.com'
        }
    }

    async outputAdmittedByTopic(payload: OutputAdmittedByTopic) {
        if (payload.mode !== 'locking-script') throw new Error('Invalid payload')
        const { topic, txid, outputIndex, lockingScript } = payload
        if (topic !== TOPIC) return

        const ls = LockingScript.fromHex(lockingScript.toHex())
        const decoded = PushDrop.decode(ls)
        const fields = decoded.fields

        // Read engine fields (always indexed).
        const subCategory = Utils.toUTF8(fields[3])

        // Anchor: fixed contract, no schema. Index engine fields only.
        if (subCategory === 'anchor') {
            const record: TokenRecord = {
                txid,
                outputIndex,
                version: Utils.toUTF8(fields[0]),
                uuid: Utils.toUTF8(fields[1]),
                category: Utils.toUTF8(fields[2]),
                subCategory,
                createdAt: Utils.toUTF8(fields[4]),
                anchorTxid: txid,
                current: true
            }
            await this.records.insertOne(record)
            return
        }

        // Look up schema to know which schema fields are indexed.
        const schema = schemas[subCategory]
        if (!schema) return   // unknown subCategory — topic manager should have rejected it

       const record: TokenRecord = {
        txid, 
        outputIndex,
        version: Utils.toUTF8(fields[0]),
        uuid: Utils.toUTF8(fields[1]),
        category: Utils.toUTF8(fields[2]),
        subCategory,
        createdAt: Utils.toUTF8(fields[4]),
        anchorTxid: Utils.toUTF8(fields[5]),
        current: true
       }

       schema.fields.forEach((field, k) => {
        if (field.indexed) record[field.name] = Utils.toUTF8(fields[ENGINE_FIELD_COUNT + k])
       })

       await this.records.insertOne(record)

    }

    async outputSpent(payload: OutputSpent) {
        if (payload.mode !== 'txid') throw new Error('Invalid payload')
        const { txid, topic, outputIndex } = payload
        if (topic !== TOPIC) return

        await this.records.updateOne({ txid, outputIndex }, { $set: { current: false }})
    }

    async outputEvicted(txid: string, outputIndex: number) {
        // Eviction = the output is gone from the chain (reorg etc.), not a normal spend.
        // Here deletion is correct — it never validly existed.
        await this.records.deleteOne({ txid, outputIndex })
    }

    async lookup(params: any): Promise<UTXOReference[]> {
        const query = params.query ?? params

        if (!query || Object.keys(query).length === 0) {
            throw new Error('Please enter a valid query.')
        }

        // Filter on engine fields + any indexed field passed in the query.
        const filter: any = {}
        if (query.anchorTxid)  filter.anchorTxid = query.anchorTxid
        if (query.category)    filter.category = query.category
        if (query.subCategory) filter.subCategory = query.subCategory
        if (query.uuid)        filter.uuid = query.uuid
        if (query.current !== undefined) filter.current = query.current
        

        const results = await this.records.find(filter).toArray()

        return results.map(r => ({ txid: r.txid, outputIndex: r.outputIndex }))
    }
}

export default (db: Db) => {
    const service = new EquusVTokenLookupService(db)
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