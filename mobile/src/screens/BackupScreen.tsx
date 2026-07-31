import { StyleSheet, View, Text, ImageBackground, Alert } from "react-native"
import { useState, useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from "expo-router"
import { generateKey, storeKey } from "@/utils/wallet"
import * as SecureStore from 'expo-secure-store'
import Heading from "@/components/text/Heading"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import BackButton from "@/components/buttons/BackButton"
import MnemonicWord from "@/components/grid/MnemonicWord"


export default function BackupScreen() {
    const [mnemonic, setMnemonic] = useState('')
    const [rootKeyHex, setRootKeyHex] = useState('')
    const [loading, setLoading] = useState(true)
    const insets = useSafeAreaInsets()
    const router = useRouter()

    useEffect(() => {
        const setup = async () => {
            try {
                const existingKey = await SecureStore.getItemAsync('rootKeyHex')
                if (existingKey) {
                    setLoading(false)
                    return
                }
                const { mnemonic, rootKeyHex } = await generateKey()
                setMnemonic(mnemonic)
                setRootKeyHex(rootKeyHex)
            } catch (error) {
                Alert.alert(
                    'Något gick fel.',
                    'Kunde inte generera nyckeln. Försök igen.',
                    [{ text: 'OK'}]
                )
            } finally {
                setLoading(false)
            }
        }
        setup()
    }, [])

    const handleSaveKey = async () => {
        await storeKey(rootKeyHex)
        router.push('/pin/create')
    }

    if (loading) return null

    const mnemonicArray = mnemonic ? mnemonic.split(' ') : [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '', ' ']

    return (
        <ImageBackground source={require('@/assets/images/horse-backup-screen.jpg')} style={styles.image} imageStyle={{ left: -25, top: -30}}>
             <View style={[styles.backButton, { top: insets.top + 16 }]}>
                <BackButton />
            </View>
            <View style={[styles.heading, { top: insets.top + 72 }]}>
                <Heading>Din återställningsnyckel</Heading>
            </View>
            <View style={styles.container}>
                <View style={styles.bodyTextTop}>
                    <Text>Spara denna nyckel säkert</Text>
                </View>
                <View style={styles.boxContainer}>
                    {mnemonicArray.map((mnem, index) => (
                         <MnemonicWord boxNumber={index + 1} key={index}>{mnem}</MnemonicWord>
                    ))}
                </View>
                <View style={styles.confirmButton}>
                    <PrimaryButton onPress={handleSaveKey}>Jag har sparat min nyckel</PrimaryButton>
                </View>
                <View style={styles.bodyTextBottom}>
                    <Text>Dela aldrig denna nyckel med någon</Text>
                </View>
            </View>
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
        alignItems: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    bodyTextTop: {
        alignItems: 'center',
        marginBottom: 36
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
    bodyTextBottom: {
        alignItems: 'center',
        marginTop: 36
    }
})