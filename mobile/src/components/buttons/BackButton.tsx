import { StyleSheet, View, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'

export default function BackButton({ color='#f7f2f2' }: { color?: string }) {
    const router = useRouter()

    return (
        <Pressable onPress={() => router.back()} style={styles.container}>
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