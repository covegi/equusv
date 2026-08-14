import { StorageUploader } from "@bsv/sdk"

export interface StorageUploaderInternal {
    getUploadInfo(fileSize: number, retentionPeriod: number): Promise<{
        uploadURL: string
        requiredHeaders: Record<string, string>
        amount?: number
    }>
    uploadFile(
        uploadURL: string,
        file: { data: Uint8Array; type: string },
        requiredHeaders: Record<string, string>
    ): Promise<{ published: boolean; uhrpURL: string }>
}
