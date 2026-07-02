import { StyleSheet, Text, TextInput, View } from "react-native"

export default function SectionRowInput({ label, value, onChangeText, hasError, placeholder, prefix, errorMessage, disabled }: { label: string, value: string, onChangeText: (text: string) => void, hasError?: boolean, placeholder: string, prefix?: string | '', errorMessage?: string, disabled?: boolean }) {
    return (
        <View style={styles.container}>
            <Text style={styles.labelText}>
                {label}
            </Text>
            { prefix ? (
                <View style={[styles.valueText, styles.prefixRow, hasError && { borderBottomColor: '#A13232' }]}>
                    <Text style={styles.prefixText}>{prefix}</Text>
                    <TextInput 
                        value={value}
                        onChangeText={(text) => onChangeText(text)}
                        style={styles.valueInput}
                        placeholder={placeholder}
                        placeholderTextColor='#8a7267'
                        keyboardType='number-pad'
                        editable={!disabled}
                    />
                </View>
            ):  <TextInput 
            value={value}
            onChangeText={(text) => onChangeText(text)}
            style={[styles.valueText, hasError && { borderBottomColor: '#A13232' }]}
            placeholder={placeholder}
            placeholderTextColor='#8a7267'
            editable={!disabled}
            />}
            {hasError && errorMessage && (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20
    },
    prefixRow: {
        flexDirection: 'row'
    },
    labelText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: '#8a7267',
        marginBottom: 6
    },
    valueText: {
        borderBottomWidth: 1.5,
        borderBottomColor: '#E8E0D8',
        fontFamily: 'Inter_300Light',
        fontSize: 14,
        paddingBottom: 10
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: '#E8E0D8',
        paddingBottom: 10,
    },
    prefixText: {
        fontFamily: 'Inter_300Light',
        fontSize: 14,
        color: '#8a7267',
    },
    valueInput: {
        flex: 1,
        fontFamily: 'Inter_300Light',
        fontSize: 14,
        color: '#1b1b1b',
        padding: 0,
    },
    errorText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: '#A13232',
        marginTop: 4,
    },
})