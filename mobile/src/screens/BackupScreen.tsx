import { StyleSheet, View, Text, Pressable, Alert, Image, ActivityIndicator } from "react-native"
import { useState, useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from "expo-router"
import { generateKey, storeKey } from "@/utils/wallet"
import * as SecureStore from 'expo-secure-store'
import BackButton from "@/components/buttons/BackButton"

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
                    // setLoading(false)
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

    // if (loading) return null

    const mnemonicArray = mnemonic ? mnemonic.split(' ') : [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']

    return (
        <View style={styles.container}>

            { loading 
                ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                    <ActivityIndicator color='#8a7267' size="large" />
                    <Text style={styles.iconText}>Skapar återställningsnyckel... </Text>
                </View>
                :
            <>
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <BackButton color='#1b1b1b' />
            </View>

            <View style={styles.intro}>
                <Text style={styles.title}>Din återställningsnyckel</Text>
                <Text style={styles.subtitle}>Skriv ner orden i ordning och förvara dem säkert.</Text>
            </View>

            <View style={styles.grid}>
                {mnemonicArray.map((word, i) => (
                    <View key={i} style={styles.cell}>
                        <View style={styles.row}>
                            <Text style={styles.num}>{i + 1}</Text>
                            <Text style={styles.word}>{word}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={{ flex: 1 }} />

            <View style={styles.recovery}>
                <Image source={require('../../assets/images/BankID_logo_neg.png')} style={styles.bankIDImage} resizeMode="contain"/>
                <Text style={styles.recoveryText}>
                    Tappar du telefonen återställer du med BankID. Orden är reservkopia om appen försvinner.
                </Text>
            </View>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
                <Pressable onPress={handleSaveKey} style={styles.btn}>
                    <Text style={styles.btnText} numberOfLines={1}>Jag har sparat min nyckel</Text>
                </Pressable>
                <Text style={styles.warning}>Dela aldrig denna nyckel med någon</Text>
            </View>
            </>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F0EB',
    },
    header: {
        paddingHorizontal: 24,
    },
    intro: {
        paddingHorizontal: 30,
        paddingTop: 18,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1b1b1b',
        letterSpacing: -0.2,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '400',
        color: '#8a7267',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 17,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 30,
        marginTop: 24,
    },
    cell: {
        width: '50%',
        paddingHorizontal: 6,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E8E0D8',
    },
    num: {
        fontSize: 10,
        color: '#8a7267',
        width: 17,
    },
    word: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1b1b1b',
    },
    recovery: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginHorizontal: 30,
        paddingTop: 14,
        marginBottom: 20,
        borderTopWidth: 0.5,
        borderTopColor: '#E8E0D8',
    },
    recoveryText: {
        flex: 1,
        fontSize: 12,
        color: '#574238',
        lineHeight: 17,
    },
    footer: {
        paddingHorizontal: 30,
    },
    btn: {
        backgroundColor: '#1b1b1b',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    warning: {
        textAlign: 'center',
        fontSize: 11,
        color: '#8a7267',
        marginTop: 16,
    },
    bankIDImage: {
        width: 34,
        height: 34,
        borderRadius: 7,
    },
    iconText: {
        fontFamily: 'Inter_300Light',
        fontSize: 12,
        color: '#574238'
    },
})