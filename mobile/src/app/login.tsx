import { Text, View } from 'react-native'
import PrimaryButton from '@/components/buttons/PrimaryButton'
import * as SecureStore from 'expo-secure-store'
import { useRouter } from 'expo-router'

export default function Login() {
    const router = useRouter()

    const handleDeleteSecureStore = async () => {
        await SecureStore.deleteItemAsync('rootKeyHex')
        router.replace('/')
    }
    
    return (
        <View style={{ paddingLeft: '40%', paddingTop: '50%'}}>
            <Text>Login Screen</Text>
            <PrimaryButton onPress={handleDeleteSecureStore}>Rensa SecureStore</PrimaryButton>
        </View>
        
    )
}