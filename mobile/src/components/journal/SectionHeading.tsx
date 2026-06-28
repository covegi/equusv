import { StyleSheet, Text, View } from 'react-native'

export default function SectionHeading({ children, fontSize=11 }: { children: string, fontSize?: number }) {
    return (
        <View>
            <Text style={[styles.text, { fontSize }]}>{children}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 11,
        color: '#B65109',
        letterSpacing: 1,
        marginBottom: 16
    }
})