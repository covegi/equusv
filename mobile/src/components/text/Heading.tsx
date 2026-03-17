import { StyleSheet, Text, View } from 'react-native'

export default function Heading( { children, fontSize=24 }: { children: string, fontSize?: number }) {
    return (
        <View>
            <Text style={[styles.text, { fontSize }]}>{children}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        fontFamily: 'Inter_400Regular',
        color: '#f7f2f2',
        letterSpacing: 0.2
    }
})