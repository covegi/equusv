import { StyleSheet, Text, View, Pressable, ActionSheetIOS, Platform } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"

export default function SectionRowPicker({ label, value, selection, onSelect, hasError, placeholder, errorMessage }: { label: string, value: string, selection: string[], onSelect: (value: string) => void, hasError?: boolean, placeholder: string, errorMessage?: string }) {

    const handlePress = () => {
        ActionSheetIOS.showActionSheetWithOptions(
            {
                options: [...selection, 'Avbryt'],
                cancelButtonIndex: selection.length,
            },
            (index) => {
                if (index < selection.length) {
                    onSelect(selection[index])
                }
            }
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.labelText}>{label}</Text>
            <Pressable onPress={handlePress} style={styles.valueRow}>
                <Text style={[styles.valueText, !value && styles.placeholder]}>
                    {value || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#8a7267" />
            </Pressable>
            {hasError && errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    labelText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: '#8a7267',
        marginBottom: 6
    },
    valueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: '#E8E0D8',
        paddingVertical: 10
    },
    valueText: {
        fontFamily: 'Inter_300Light',
        fontSize: 14,
        color: '#1b1b1b',
    },
    placeholder: {
        color: '#8a7267',
    },
    errorText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: '#A13232',
        marginTop: 4,
    },
})