import { ReactNode } from "react"
import { StyleSheet, Text, Pressable } from "react-native"
import type { LayoutChangeEvent } from "react-native"

export default function FilterButton({ children, isActive, onPress, onLayout }: { children: ReactNode, isActive: boolean, onPress: () => void, onLayout?: (e: LayoutChangeEvent) => void }) {

    return (
        <Pressable
            onPress={onPress}
            onLayout={onLayout}
            style={[styles.container, isActive && styles.active]}
        >
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