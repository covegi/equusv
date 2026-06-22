import EquusVPassportTopicManager from "./topic-managers/identity/EquusVPassportTopicManager.js"
import EquusVPassportLookupServiceFactory from "./lookup-services/identity/EquusVPassportLookupServiceFactory.js"
import type { EquusVPassportRecord, UTXOReference } from "./types/identity/passport.js"

export const tm_passport = EquusVPassportTopicManager

function initLookupService(db: any) {
    console.log("LARS requested PASSPORT Lookup Service. Initializing factory...")
    try {
        const service = EquusVPassportLookupServiceFactory(db)
        return service
    } catch (error) {
        console.error("Failed to initialize PASSPORT Lookup Service:", error)
        throw error
    }
}

const UniversalExport: any = function(this: any, dbOrOptions: any) {
    if (this instanceof UniversalExport) {
        return new EquusVPassportTopicManager()
    }
    return initLookupService(dbOrOptions)
}

export default UniversalExport

export const serviceMetaData = {
    name: 'EquusV Passport Service',
    version: '0.1.0'
}

export type { EquusVPassportRecord, UTXOReference }