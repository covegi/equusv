import { StyleSheet, Text, View } from "react-native"

export default function BodyText({ children, fontSize=18, color='#f7f2f2' }: { children: string, fontSize?: number, color?: string }) {
    return (
        <View>
            <Text style={[styles.text, { fontSize, color }]}>{children}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        fontFamily: 'Inter_300Light',
        letterSpacing: 0.2,
        lineHeight: 22
    }
})