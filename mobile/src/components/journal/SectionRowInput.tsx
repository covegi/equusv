import { StyleSheet, Text, TextInput, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"

export default function SectionRowInput({ label, value, onChangeText, hasError }: { label: string, value: string, onChangeText: (text: string) => void, hasError?: boolean }) {
    return (
        <View style={styles.container}>
            <Text style={styles.labelText}>{label}:</Text>
            <TextInput 
                value={value}
                onChangeText={(text) => onChangeText(text)}
                style={styles.valueText}
            />
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
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    labelText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        width: 100,
    },
    valueText: {
        flex: 1,
        height: 36,
        fontFamily: 'Inter_300Light',
        fontSize: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a'
    }
})