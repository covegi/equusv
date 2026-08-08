import EquusVIdentityTopicManager from "./topic-managers/credentials/EquusVIdentityTopicManager.js"
import EquusVIdentityLookupServiceFactory from "./lookup-services/credentials/EquusVIdentityLookupServiceFactory.js"
import type { EquusVIdentityRecord, UTXOReference } from "./types/credentials/identity.js"

export const tm_identity = EquusVIdentityTopicManager

function initLookupService(db: any) {
    console.log("LARS requested IDENTITY Lookup Service. Initializing factory...")
    try {
        const service = EquusVIdentityLookupServiceFactory(db)
        return service
    } catch (error) {
        console.error("Failed to initialize IDENTITY Lookup Service:", error)
        throw error
    }
}

const UniversalExport: any = function(this: any, dbOrOptions: any) {
    if (this instanceof UniversalExport) {
        return new EquusVIdentityTopicManager()
    }
    return initLookupService(dbOrOptions)
}

export default UniversalExport

export const serviceMetaData = {
    name: 'EquusV Identity Service',
    version: '0.1.0'
}

export type { EquusVIdentityRecord, UTXOReference }