import { StyleSheet, Text, View, Switch } from "react-native"

export default function SectionRowToggle({ label, value, onValueChange }: { label: string, value: boolean, onValueChange: (value: boolean) => void }) {

    return (
        <View style={styles.container}>
            <Text style={styles.labelText}>{label}:</Text>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#E8E0D8', true: '#2E7D32' }}
                thumbColor="#fff"
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    labelText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: '#1b1b1b',
    },
})