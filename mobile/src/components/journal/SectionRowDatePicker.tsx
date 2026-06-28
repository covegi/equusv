import { StyleSheet, View, Text, Pressable } from "react-native"
import { useState } from "react"
import { Calendar } from 'react-native-calendars'
import Ionicons from "@expo/vector-icons/Ionicons"

export default function SectionRowDatePicker({ label, value, onSelect, hasError, placeholder, errorMessage }: { label: string, value: string, onSelect: (value: string) => void, hasError: boolean | undefined, placeholder: string, errorMessage?: string }) {
    const [showCalendar, setShowCalendar] = useState(false)

    return (
        <View style={styles.container}>
            <Text style={styles.labelText}>{label}</Text>
            <Pressable onPress={() => setShowCalendar(!showCalendar)} style={styles.valueRow} >
                <Text style={[styles.valueText, !value && styles.placeholder]}>{value || placeholder}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="calendar-outline" size={18} color="#8a7267" />
                    <Ionicons name={showCalendar ? "chevron-up" : "chevron-down"} size={16} color="#8a7267" />
                </View>
            </Pressable>
            {hasError && errorMessage && (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                )}
            {showCalendar && (
                <Calendar 
                    theme={{
                        calendarBackground: '#fff',
                        textSectionTitleColor: '#8a7267',
                        selectedDayBackgroundColor: '#B65109',
                        selectedDayTextColor: '#fff',
                        todayTextColor: '#B65109',
                        dayTextColor: '#1b1b1b',
                        textDisabledColor: '#E8E0D8',
                        arrowColor: '#574238',
                        monthTextColor: '#1b1b1b',
                    }}
                    onDayPress={(day) => {
                        onSelect(day.dateString)
                        setShowCalendar(false)
                    }}
                    markedDates={value ? { [value]: { selected: true } }: {}}
                />
            )}
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20
    },
    labelText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: ' #8a7267',
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