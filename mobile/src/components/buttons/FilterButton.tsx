import { ReactNode } from "react"
import { StyleSheet, Text, Pressable } from "react-native"

export default function FilterButton({ children, isActive, disabled, onPress }: { children: ReactNode, isActive: boolean, disabled: boolean, onPress: () => void }) {

    return (
        <Pressable onPress={onPress} style={[styles.container, isActive && styles.active]} disabled={disabled}>
            <Text style={[isActive && styles.activeText]}>{children}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginLeft: 12,
        marginTop: 16,
        borderRadius: 20,
        backgroundColor: '#fff'
    },
    active: {
        backgroundColor: '#574238',
    },
    activeText: {
        color: '#fff'
    }
})