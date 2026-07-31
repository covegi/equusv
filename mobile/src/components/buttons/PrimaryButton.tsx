import { StyleSheet, Text, Pressable } from "react-native"

export default function PrimaryButton({ children, onPress }: { children: string, onPress: () => void | Promise<void> }) {
    return (
        <Pressable style={styles.container} onPress={onPress}>
            <Text style={styles.label}>{children}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#574238',
        borderRadius: 8,
        padding: 16,

    },
    label: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: '#fff',
    }
})