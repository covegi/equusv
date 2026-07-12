import { useRole } from '@/context/RoleContext'
import OwnerScreen from '@/screens/OwnerScreen'
import BreedingOrgScreen from '@/features/roles/breedingOrg/BreedingOrgScreen'

export default function HomeScreen() {
    const { activeRole } = useRole()

    switch (activeRole) {
        case 'breedingOrg':
            return <BreedingOrgScreen />
        default:
            return <OwnerScreen />
    }
}