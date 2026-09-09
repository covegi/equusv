import type { Schema } from "../types/schema.js"
import { foodChainStatus } from "./identity/food-chain-status.js"

export const schemas: Record<string, Schema> = {
    [foodChainStatus.subCategory]: foodChainStatus
}