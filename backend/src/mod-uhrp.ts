import EquusVUHRPTopicManager from "./topic-managers/identity/EquusVUHRPTopicManager.js"
import EquusVUHRPLookupServiceFactory from "./lookup-services/identity/EquusVUHRPLookupServiceFactory.js"
import type { EquusVUHRPRecord, UTXOReference } from "./types/identity/uhrp.js"

export const tm_uhrp = EquusVUHRPTopicManager

function initLookupService(db: any) {
    console.log("LARS requested UHRP Lookup Service. Initializing factory...")
    try {
        const service = EquusVUHRPLookupServiceFactory(db)
        return service
    } catch (error) {
        console.error("Failed to initialize UHRP Lookup Service:", error)
        throw error
    }
}

const UniversalExport: any = function(this: any, dbOrOptions: any) {
    if (this instanceof UniversalExport) {
        return new EquusVUHRPTopicManager()
    }
    return initLookupService(dbOrOptions)
}

export default UniversalExport

export const serviceMetaData = {
    name: 'EquusV UHRP Service',
    version: '0.1.0'
}

export type { EquusVUHRPRecord, UTXOReference }