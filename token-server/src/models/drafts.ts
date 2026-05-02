import mongoose from "mongoose"

const draftSchema = new mongoose.Schema({
    tokenType: { type: String, required: true },
    identityKey: { type: String, required: true },
    ueln: { type: String, required: true },
    status: { type: String, required: true },
    encryptedData: { type: String, required: true },
    comment: { type: String },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true}
})

export const Draft = mongoose.model('Draft', draftSchema)