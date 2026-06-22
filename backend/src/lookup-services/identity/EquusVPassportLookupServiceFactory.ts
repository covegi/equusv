import type { AdmissionMode, LookupService, OutputAdmittedByTopic, OutputSpent, SpendNotificationMode } from "@bsv/overlay"
import { PushDrop, Utils, LockingScript } from '@bsv/sdk'
import type { EquusVPassportRecord, UTXOReference } from "../../types/identity/passport.js"
import equusVHorsePassportLookupServiceDocsMd from "../../docs/identity/EquusVPassportLookupServiceDocs.md.js"
import { Db, Collection } from 'mongodb'

class EquusVHorsePassportLookupService implements LookupService {
    readonly admissionMode: AdmissionMode = 'locking-script'
    readonly spendNotificationMode: SpendNotificationMode = 'txid'
    records: Collection<EquusVPassportRecord>

    constructor(db: Db) {
        this.records = db.collection<EquusVPassportRecord>('horse_passport_records')
    }

    async getDocumentation(): Promise<string> {
        return equusVHorsePassportLookupServiceDocsMd
    }

    async getMetaData(): Promise<{name: string, shortDescription: string, iconURL?: string, version?: string, informationURL: string}> {
        return {
            name: 'EquusV Identity Passport Lookup Service',
            shortDescription: 'Query horse passport tokens by UELN or chip number',
            version: '0.1.0',
            informationURL: 'https://www.equusv.com'
        }
    }

    async outputAdmittedByTopic(payload: OutputAdmittedByTopic) {
        if (payload.mode !== 'locking-script') throw new Error('Invalid payload')
        const { topic, txid, outputIndex, lockingScript } = payload
        if (topic !== 'tm_horse_passport') return

        const ls = LockingScript.fromHex(lockingScript.toHex())
        const decoded = PushDrop.decode(ls)

        await this.records.insertOne({
            txid,
            outputIndex,
            version: Utils.toUTF8(decoded.fields[0]),
            name: Utils.toUTF8(decoded.fields[1]),
            breed: Utils.toUTF8(decoded.fields[2]),
            birthDate: Utils.toUTF8(decoded.fields[3]),
            sex: Utils.toUTF8(decoded.fields[4]),
            color: Utils.toUTF8(decoded.fields[5]),
            ueln: Utils.toUTF8(decoded.fields[6]),
            chip: Utils.toUTF8(decoded.fields[7]),
            ownerAtRegistration: Utils.toUTF8(decoded.fields[8]),
            location: Utils.toUTF8(decoded.fields[9]),
            organisation: Utils.toUTF8(decoded.fields[10]),
            issuedDate: Utils.toUTF8(decoded.fields[11]),
            foodChainStatus: Utils.toUTF8(decoded.fields[12]) === 'true'
        })
        console.log(`Horse passport indexed: ${Utils.toUTF8(decoded.fields[6])}`)
    }

    async outputSpent(payload: OutputSpent) {
        if (payload.mode !== 'txid') throw new Error('Invalid payload')
        const { txid, topic, outputIndex } = payload
        if (topic !== 'tm_horse_passport') return

        await this.records.deleteOne({ txid, outputIndex })
    }

    async outputEvicted(txid: string, outputIndex: number) {
        await this.records.deleteOne({ txid, outputIndex })
    }

    async lookup(params: any): Promise<UTXOReference[]> {
        const query = params.query ?? params

        if (!query || Object.keys(query).length === 0) {    
            throw new Error('Please enter a valid query.')
        }

        let filter: any = {}
        if (query.name) filter.name = query.name
        if (query.breed) filter.breed = query.breed
        if (query.birthDate) filter.birthDate = query.birthDate
        if (query.sex) filter.sex = query.sex
        if (query.color) filter.color = query.color
        if (query.ueln) filter.ueln = query.ueln
        if (query.chip) filter.chip = query.chip
        if (query.ownerAtRegistration) filter.ownerAtRegistration = query.ownerAtRegistration
        if (query.location) filter.location = query.location
        if (query.organisation) filter.organisation = query.organisation
        if (query.issuedDate) filter.issuedDate = query.issuedDate
        if (query.foodChainStatus) filter.foodChainStatus = query.foodChainStatus

        const results = await this.records.find(filter).toArray()
        console.log('MongoDB results:', JSON.stringify(results, null, 2))
        if (results.length > 0) {
            console.log(`Query commitment: ${results}`)
        }

        return results.map(result => ({
            txid: result.txid,
            outputIndex: result.outputIndex
        }))
    }
}

export default (db: Db) => {
    const service = new EquusVHorsePassportLookupService(db)
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