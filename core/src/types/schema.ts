export type Schema = {
    category: 'identity' | 'training',
    subCategory: string,
    version: number,

    mode: 'status' | 'event'

    fields:
        { 
            name: string
            label: string,
            type: 'string' | 'date' | 'boolean' | 'number' | 'enum' | 'txid-ref',
            required: boolean,
            encrypted: boolean,
            indexed?: boolean,
            refType?: string
        }[]

    signing: string[],
    visibility: string[],
    process: boolean
}