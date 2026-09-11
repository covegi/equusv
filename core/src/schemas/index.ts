import type { Schema } from "../types/schema.js"
import { foodChainStatus } from "./identity/food-chain-status.js"
import { trainingSession } from './training/training-session.js'

export const schemas: Record<string, Schema> = {
    [foodChainStatus.subCategory]: foodChainStatus,
    [trainingSession.subCategory]: trainingSession
}