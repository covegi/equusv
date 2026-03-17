import { StyleSheet, Text, Pressable } from 'react-native'

export default function SecondaryButton({ children, onPress }: { children: string, onPress: () => void }) {
    return (
        <Pressable style={styles.container} onPress={onPress}>
            <Text style={styles.label}>{children}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignSelf: 'center'
    },
    label: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: '#f7f2f2',
        letterSpacing: 0.2
    }
})