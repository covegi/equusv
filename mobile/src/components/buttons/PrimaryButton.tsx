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
        backgroundColor: '#d06212',
        borderRadius: 8,
        shadowColor: '#1a1a1a',
        shadowOffset: { width: 0, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 18,
        alignSelf: 'center'
    },
    label: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 18,
        color: '#f7f2f2',
        letterSpacing: 0.2
    }
})