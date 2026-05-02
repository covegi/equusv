import mongoose, { Document } from "mongoose"

interface IDraft extends Document {
    tokenType: string
    identityKey: string
    ueln: string
    status: string
    encryptedData: string
    comment?: string
    createdAt: string
    updatedAt: string
}

const draftSchema = new mongoose.Schema<IDraft>({
    tokenType: { type: String, required: true },
    identityKey: { type: String, required: true },
    ueln: { type: String, required: true },
    status: { type: String, required: true },
    encryptedData: { type: String, required: true },
    comment: { type: String },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true}
})

export const Draft = mongoose.model<IDraft>('Draft', draftSchema)