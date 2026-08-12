import { StyleSheet, Text, TextInput, View, Alert, KeyboardAvoidingView, Platform, Pressable, Image, ActivityIndicator } from "react-native"
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useState } from "react"

import BackButton from "@/components/buttons/BackButton"
import { restoreWallet } from "@/utils/wallet"
import { ScrollView } from "react-native-gesture-handler"

function WordField({ index, value, onChange }: { index: number, value: string, onChange: (value: string) => void }) {
    const [focused, setFocused] = useState(false)
    return (
        <View style={styles.cell}>
            <View style={[styles.row, focused && styles.rowFocused]}>
                <Text style={[styles.num, focused && styles.numFocused]}>{index + 1}</Text>
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={styles.word}
                    autoCapitalize='none'
                    autoCorrect={false}
                    autoComplete='off'
                />
            </View>
        </View>
    )
}

export default function RestoreScreen() {
    const insets = useSafeAreaInsets()
    const [words, setWords] = useState(['', '', '', '', '', '', '', '', '', '', '', '' ])
    const [loading, setLoading] = useState(false)
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
        
        setLoading(true)

        try {
            const wallet = await restoreWallet(words)
            if (wallet) {
                router.replace('/pin/create')
            } else {
            Alert.alert(
                'Något gick fel.',
                'Arkivet kunde inte återskapas. Försök igen.',
                [{ text: 'OK'}]
            )}
        } catch (error) {
            console.log(error)
            Alert.alert(
                'Något gick fel.',
                'Arkivet kunde inte återskapas. Försök igen.',
                [{ text: 'OK' }]
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            { loading 
                ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                    <ActivityIndicator color='#8a7267' size="large" />
                    <Text style={styles.iconText}>Återskapar profil... </Text>
                </View>
            : 
            <>
            <View style={[styles.header, { top: insets.top + 8 }]} >
                <BackButton color='#1b1b1b' />
            </View>

            <View style={styles.intro} >
                <Text style={styles.title}>Återställ arkiv</Text>
                <Text style={styles.subtitle}>Skriv in dina tolv ord i ordning.</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding': 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps='handled'
                >
                     <View style={styles.grid}>
                        {words.map((word, index) => (
                            <WordField
                                index={index}
                                key={index}
                                value={word}
                                onChange={(value) => handleWordInput(index, value)}
                            />
                        ))}
                    </View>
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
                <Pressable
                    onPress={() => {
                        // TODO: BankID-recovery — trigga Criipto-auth, skicka assertering + ny pubkey
                        // till token-serverns recovery-endpoint, som medsignerar omlåsning av tokens.
                        console.log('BankID recovery initialized...')
                    }}
                    style={styles.bankIDRow}
                >
                    <Image
                        source={require('../../assets/images/BankID_logo_neg.png')}
                        style={styles.bankIDImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.bankIDText}>
                        Har du inte dina ord? <Text style={styles.bankIDLink}>Återställ med BankID</Text>
                    </Text>
                </Pressable>

                    <Pressable onPress={handleKeyCheck} style={styles.btn}>
                        <Text style={styles.btnText}>Återställ</Text>
                    </Pressable>
                </View>
            
            
            </KeyboardAvoidingView>  
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
    scroll: {
        paddingTop: 24,
        paddingHorizontal: 30,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cell: {
        width: '50%',
        paddingHorizontal: 6,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E8E0D8',
    },
    rowFocused: {
        borderBottomWidth: 1.5,
        borderBottomColor: '#1b1b1b',
    },
    num: {
        fontSize: 10,
        color: '#8a7267',
        width: 17,
    },
    numFocused: {
        color: '#1b1b1b',
        fontWeight: '600',
    },
    word: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#1b1b1b',
        padding: 0,
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
    bankIDRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingTop: 12,
        marginBottom: 14,
        borderTopWidth: 0.5,
        borderTopColor: '#E8E0D8',
    },
    bankIDImage: {
        width: 28,
        height: 28,
        borderRadius: 6,
    },
    bankIDText: {
        flex: 1,
        fontSize: 12,
        color: '#574238',
        lineHeight: 17,
    },
    bankIDLink: {
        color: '#1b1b1b',
        fontWeight: '600',
    },
    iconText: {
        fontFamily: 'Inter_300Light',
        fontSize: 12,
        color: '#574238'
    }
})