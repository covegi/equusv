export interface BreedingOrgCardProps {
    name: string
    category: string
    taskLabel: string
    breed: string
    sex: string
    birthDate: string
    image?: string
    statusText: string
    onPress: () => void
}