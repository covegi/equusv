import { StyleSheet, View, ImageBackground, Alert, KeyboardAvoidingView, Platform } from "react-native"
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useState } from "react"

import BackButton from "@/components/buttons/BackButton"
import Heading from "@/components/text/Heading"
import MnemonicWordInput from "@/components/grid/MnemonicWordInput"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import { restoreWallet } from "@/utils/wallet"

export default function RestoreScreen() {
    const insets = useSafeAreaInsets()
    const [words, setWords] = useState(['', '', '', '', '', '', '', '', '', '', '', '' ])
    const router = useRouter()

    const handleWordInput = ( index: number, value: string ) => {
        const updated = [...words]
        updated[index] = value
        setWords(updated)
    }

    const handleKeyCheck = async () => {
        const allFilled = words.every(word => word.trim().length > 0)
        if (!allFilled) {
            Alert.alert(
                'Fyll i alla 12 orden', 
                '',
                [{ text: 'OK'}]
            )
            return
        }
        const wallet = await restoreWallet(words)
        if (wallet) {
            router.replace('pin/create')
        } else {
            Alert.alert(
                'Något gick fel.',
                'Arkivet kunde inte återskapas. Försök igen.',
                [{ text: 'OK'}]
            )
        }
    }

    return (
            <ImageBackground source={require('@/assets/images/horse-backup-screen.jpg')} style={styles.image} imageStyle={{ left: -25, top: -30 }}>
            <View style={[styles.backButton, { top: insets.top + 16 }]} >
                <BackButton/>
            </View>
            <View style={[styles.heading, { top: insets.top + 72 }]} >
                <Heading>Återställ arkiv</Heading>
            </View>
            <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding': 'height'}
            style={{ flex: 1 }}
            >
            <View style={styles.container}>
                <View style={styles.boxContainer}>
                    {words.map((word, index) => (
                        <MnemonicWordInput
                            index={index}
                            key={index}
                            value={word}
                            onChange={(value) => handleWordInput(index, value)}
                        />
                    ))}
                </View>
            <View style={styles.confirmButton}>
            <PrimaryButton onPress={handleKeyCheck}>
                Återställ
            </PrimaryButton>
            </View>
            
            </View>
            </KeyboardAvoidingView>   
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    image: {
        flex: 1
    },
    backButton: {
        position: 'absolute',
        left: 16
    },
    heading: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center'
    },
    container: {
        flex: 1,
        paddingTop: 160
    },
    boxContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8
    },
    confirmButton: {
        marginTop: 32
    },
})