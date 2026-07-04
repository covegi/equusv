import { ReactNode, useState } from "react"
import { StyleSheet, View, Text, Pressable, Modal } from "react-native"
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from "@expo/vector-icons/Feather"
import PassportModal from "../modal/PassportModal"

export default function Header({ children, onHorseCreated }: { children: ReactNode, onHorseCreated?: () => void }) {
    const [newPassportVisible, setNewPassportVisible] = useState(false)
    const insets = useSafeAreaInsets()

    return (
        <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
            <Pressable>
                <Feather name='menu' size={22} color='#574238' />
            </Pressable>
            <Text style={styles.heading}>{children}</Text>
            <Pressable onPress={() => setNewPassportVisible(true)}>
                <Feather name='plus' size={22} color='#574238' />
            </Pressable>
            <PassportModal
                visible={newPassportVisible}
                onClose={() => setNewPassportVisible(false)}
                onSaved={() => {
                    setNewPassportVisible(false)
                    onHorseCreated?.()
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F5F0EB',
        paddingHorizontal: 25,
        
    },
    heading: {
        fontFamily: 'Inter_600SemiBold', 
        fontSize: 18,
        color: '#1b1b1b'
    }
})