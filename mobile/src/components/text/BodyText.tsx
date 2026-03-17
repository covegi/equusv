import { StyleSheet, Text, View } from "react-native"

export default function BodyText({ children, fontSize=18 }: { children: string, fontSize?: number }) {
    return (
        <View>
            <Text style={[styles.text, { fontSize }]}>{children}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        fontFamily: 'Inter_300Light',
        color: '#f7f2f2',
        letterSpacing: 0.2,
        lineHeight: 22
    }
})