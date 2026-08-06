import { StyleSheet, Text, View, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native"
import { useState } from 'react'
import { useSafeAreaInsets } from "react-native-safe-area-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from 'expo-router'
import BackButton from "@/components/buttons/BackButton"


export default function CreateProfileScreen() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [focused, setFocused] = useState<'first' | 'last' | null>(null)

    const valid = firstName.trim().length > 0 && lastName.trim().length > 0

    const handleNext = async () => {
        if (!valid) return

        await AsyncStorage.setItem('onboarding-name', JSON.stringify(
            {
                firstName: firstName.trim(),
                lastName: lastName.trim()
            }
        ))
        router.push('/backup')

    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
                <BackButton color='#1b1b1b' />
            </View>

            <Text style={styles.title}>Vad heter du?</Text>
            <Text style={styles.subtitle}>Ditt namn visas på ditt certifikat.</Text>

            <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Förnamn</Text>
                <TextInput 
                    value={firstName}
                    onChangeText={setFirstName}
                    onFocus={() => setFocused('first')}
                    onBlur={() => setFocused(null)}
                    style={[styles.input, focused === 'first' && styles.inputFocused]}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                />
            </View>

            <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Efternamn</Text>
                <TextInput 
                    value={lastName}
                    onChangeText={setLastName}
                    onFocus={() => setFocused('last')}
                    onBlur={() => setFocused(null)}
                    style={[styles.input, focused === 'last' && styles.inputFocused]}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleNext}
                />
            </View>

            <TouchableOpacity
                style={[styles.button, !valid && styles.buttonDisabled]}
                onPress={handleNext}
                disabled={!valid}
            >
                <Text style={styles.buttonText}>Fortsätt</Text>
            </TouchableOpacity>

        </KeyboardAvoidingView>
    )

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F0EB',
        paddingHorizontal: 30,
    },
    header: {
        position: 'absolute',       
        left: 0,
        paddingHorizontal: 30,
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1b1b1b',
        marginTop: 140,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#574238',
        marginBottom: 40,
        lineHeight: 21,
    },
    fieldGroup: {
        marginBottom: 24,
    },
    fieldLabel: {
        fontSize: 12,
        color: '#8a7267',
        marginBottom: 8,
    },
    input: {
        fontSize: 17,
        color: '#1b1b1b',
        paddingVertical: 8,
        padding: 0,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E8E0D8',
    },
    inputFocused: {
        borderBottomWidth: 1.5,
        borderBottomColor: '#1b1b1b',
    },
    spacer: {
        flex: 1,
    },
    button: {
        backgroundColor: '#1b1b1b',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 40,
    },
    buttonDisabled: {
        backgroundColor: '#b8ab9e',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#F5F0EB',
    },
})