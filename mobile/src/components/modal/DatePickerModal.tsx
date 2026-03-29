import { StyleSheet, Text, View, Modal, TouchableOpacity } from "react-native"
import { useState } from 'react'
import { useSafeAreaInsets } from "react-native-safe-area-context"
import DateTimePicker from '@react-native-community/datetimepicker'

import SecondaryButton from "../buttons/SecondaryButton"

export default function DatePickerModal({ show, onClose, onChangeText }: { show: boolean, onClose: () => void, onChangeText: (text: string) => void }) {
    const insets = useSafeAreaInsets()
    const [date, setDate] = useState(new Date())

    return (
        <Modal visible={show} transparent animationType="slide">
                <View style={styles.outerContainer}>
                    <View style={[styles.headerContainer, { top: insets.top + 16 }]}>
                        <Text style={styles.headerText}>Född</Text>
                    </View>
                    <View style={styles.datePickerContainer}>
                        <DateTimePicker 
                            value={date}
                            mode='date'
                            display='spinner'
                            locale='sv-SE'
                            onChange={(event, selectedDate) => {
                                const dateStr = selectedDate?.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' }) ?? ''
                                setDate(selectedDate ?? date)
                                onChangeText(dateStr)
                            }}
                        />
                    </View>
                    <View style={styles.saveButton}>
                        <SecondaryButton
                            color='#1a1a1a'
                            fontSize={16}
                            onPress={() => {
                                onChangeText(date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' }))
                                onClose()
                            }}
                        >
                            Spara
                        </SecondaryButton>
                    </View>
                </View>            
        </Modal>
    )
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#f7f2f2',
        alignItems: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginLeft: 15,
    },
    headerText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
    },
    datePickerContainer: {
        alignItems: 'center',
        marginTop: '40%'
    },
    saveButton: {
       
        marginTop: 16,
    }
})