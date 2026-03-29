import { StyleSheet, Text, View } from 'react-native'

export default function SectionHeading({ children, fontSize=16 }: { children: string, fontSize?: number }) {
    return (
        <View>
            <Text style={[styles.text, { fontSize }]}>{children}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        fontFamily: 'Inter_600SemiBold',
        color: '#1a1a1a',
        marginTop: 5,
    }
})