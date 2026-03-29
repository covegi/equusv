import { StyleSheet, Text, View } from "react-native"
import { useState } from 'react'
import { Checkbox} from 'expo-checkbox'

export default function SectionRowCheckbox({ label, value, onValueChange }: { label: string, value: string, onValueChange: (value: string) => void }) {
    const [isChecked, setIsChecked] = useState(value === 'Ingår')

    return (
        <View style={styles.container}>
            <Text style={styles.labelText}>{label}:</Text>
            <Checkbox
                value={isChecked}
                onValueChange={(checked) => {
                    setIsChecked(checked)
                    onValueChange(checked ? 'Ingår' : 'Ingår ej')
                }}
            />
            <Text style={styles.checkboxText}>Ingår</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    labelText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        width: 100,
    },
    checkboxText: {
        fontFamily: 'Inter_300Light',
        fontSize: 14,
        marginLeft: 10
    }
})