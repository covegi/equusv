import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native"
import { useState } from "react"
import Ionicons from "@expo/vector-icons/Ionicons"

import DatePickerModal from "../modal/DatePickerModal"

export default function SectionRowDateInput({ label, value, onChangeText, hasError }: {label: string, value: string, onChangeText: (text: string) => void, hasError?: boolean}) {
    const [show, setShow] = useState(false)

    return (
        <View style={styles.container}>
            <Text style={styles.labelText}>{label}:</Text>
            <TouchableOpacity onPress={() => setShow(true)} style={styles.valueContainer}>
                <DatePickerModal
                    show={show}
                    onClose={() => setShow(false)} 
                    onChangeText={onChangeText}
                />
            <Text style={styles.date}>{value}</Text>
            
        </TouchableOpacity>
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
    valueContainer: {
        flex: 1,
        height: 36,
        fontFamily: 'Inter_300Light',
        fontSize: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a'
    },
    date: {
        fontFamily: 'Inter_300Light',
        fontSize: 14,
        paddingTop: 8
    }
})



