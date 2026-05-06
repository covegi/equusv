import { StyleSheet, Text, View } from 'react-native'

export default function Heading( { children, fontSize=24, color='#f7f2f2' }: { children: string | undefined, fontSize?: number, color?: string }) {
    return (
        <View>
            <Text style={[styles.text, { fontSize, color }]}>{children}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        fontFamily: 'Inter_600SemiBold',
        letterSpacing: 0.2,
    }
})