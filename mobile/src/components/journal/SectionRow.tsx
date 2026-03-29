import { StyleSheet, Text, View } from 'react-native'

export default function SectionRow({ label, value }: { label: string, value: string }) {
    return (
        <View style={styles.container}>
            <Text style={styles.labelText}>{label}:</Text>
            <Text style={styles.valueText}>{value}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginTop: 5,
    },
    labelText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        width: 100,
    },
    valueText: {
        fontFamily: 'Inter_300Light',
        fontSize: 14,
    }
})