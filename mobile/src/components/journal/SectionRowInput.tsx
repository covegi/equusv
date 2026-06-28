import { StyleSheet, Text, TextInput, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"

export default function SectionRowInput({ label, value, onChangeText, hasError, placeholder, prefix }: { label: string, value: string, onChangeText: (text: string) => void, hasError?: boolean, placeholder: string, prefix?: string | '' }) {
    return (
        <View style={styles.container}>
            <Text style={styles.labelText}>{label}</Text>
            { prefix ? (
                <View style={styles.prefixRow}>
                    <Text style={styles.prefixText}>{prefix}</Text>
                    <TextInput 
                        value={value}
                        onChangeText={(text) => onChangeText(text)}
                        style={styles.valueInput}
                        placeholder={placeholder}
                        placeholderTextColor='#8a7267'
                        keyboardType='number-pad'
                    />
                </View>
            ):  <TextInput 
            value={value}
            onChangeText={(text) => onChangeText(text)}
            style={styles.valueText}
            placeholder={placeholder}
            placeholderTextColor='#8a7267'
            />}
            {value.length > 0
                    ? <Ionicons name='checkmark' size={18} color='green' />
                    : hasError 
                        ? <Ionicons name='close' size={18} color='red' />
                        : null
            }
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
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: '#1b1b1b',
    },
    valueInput: {
        flex: 1,
        fontFamily: 'Inter_300Light',
        fontSize: 14,
        color: '#1b1b1b',
        padding: 0,
    },
})