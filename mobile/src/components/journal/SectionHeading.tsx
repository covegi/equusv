import { StyleSheet, Text, View } from 'react-native'

export default function SectionHeading({ children, fontSize=11, color='#B65109' }: { children: string, fontSize?: number, color?: string }) {
    return (
        <View>
            <Text style={[styles.text, { fontSize, color }]}>{children}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 11,
        letterSpacing: 1,
        marginBottom: 16
    }
})