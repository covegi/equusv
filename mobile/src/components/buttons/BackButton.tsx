import { StyleSheet, View, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import AntDesign from '@expo/vector-icons/AntDesign'

export default function BackButton({ color='#f7f2f2', emptyPin }: { color?: string, emptyPin?: boolean}) {
    const router = useRouter()

    const handleOnPress = async () => {
        if (emptyPin) {
            await SecureStore.deleteItemAsync('pin')
        }
        router.back()
    }

    return (
        <Pressable onPress={handleOnPress} style={styles.container}>
            <View>
                <AntDesign name="arrow-left" size={24} color={color} />
            </View>
        </Pressable> 
    )
}

const styles = StyleSheet.create({
    container: {
        zIndex: 5,
        paddingTop: "5%",
    }
})