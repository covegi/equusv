import EquusVTokenTopicManager from "./topic-managers/EquusVTokenTopicManager.js"
import EquusVTokenLookupServiceFactory from "./lookup-services/EquusVTokenLookupServiceFactory.js"

export const tm_equusv = EquusVTokenTopicManager

function initLookupService(db: any) {
    console.log('LARS requested EQUUSV Lookup Service. Initializing factory...')
    try {
        const service = EquusVTokenLookupServiceFactory(db)
        return service
    } catch (error) {
        console.error('Failed to initialize EQUUSV Lookup Service:', error)
        throw error
    }
}

const UniversalExport: any = function(this: any, dbOrOptions: any) {
    if (this instanceof UniversalExport) {
        return new EquusVTokenTopicManager()
    }
    return initLookupService(dbOrOptions)
}

export default UniversalExport

export const serviceMetaData = {
    name: 'EquusV Token Service',
    version: '0.1.0'
}
