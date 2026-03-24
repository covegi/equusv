import { StyleSheet, Text, View } from 'react-native'
import PrimaryButton from '@/components/buttons/PrimaryButton'
import * as SecureStore from 'expo-secure-store'
import { useRouter } from 'expo-router'

export default function MyHorses() {
    const router = useRouter()

    const handleDeleteSecureStore = async () => {
        await SecureStore.deleteItemAsync('rootKeyHex')
        router.replace('/')
    }
    
    return (
        <View style={styles.container}>
            <Text>MyHorsesScreen</Text>
            <PrimaryButton onPress={handleDeleteSecureStore}>Rensa SecureStore</PrimaryButton>
        </View>
        
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20
    }
})