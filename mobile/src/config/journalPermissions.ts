import type { RoleId } from "@/constants/certificates"

export const journalPermissions: Record<RoleId, string[]> = {
    owner: ['Alla', 'Idenitet', 'Hälsa', 'Avel', 'Livscykel'],
    breedingOrg: ['Alla', 'Identitet']
}