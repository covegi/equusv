import { StyleSheet, Text, Pressable } from 'react-native'

export default function SecondaryButton({ children, color='#f7f2f2', fontSize=12, onPress }: { children: string,color?: string, fontSize?: number, onPress: () => void }) {
    return (
        <Pressable style={styles.container} onPress={onPress}>
            <Text style={[styles.label, { color, fontSize }]}>{children}</Text>
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
        letterSpacing: 0.2
    }
})