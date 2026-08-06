import { StyleSheet, Text, View, TouchableOpacity, Animated, Alert } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as SecureStore from 'expo-secure-store'
import { useRouter } from 'expo-router'
import { useWallet } from '@/context/WalletContext'
import { CERT_TYPE_HORSE_OWNER } from '../constants/certificates'

import BackButton from '@/components/buttons/BackButton'
import { loadWallet } from '@/utils/wallet'

const TOKEN_SERVER_URL = process.env.EXPO_PUBLIC_TOKEN_SERVER_URL
const EQUUSV_IDENTITY_KEY = process.env.EXPO_PUBLIC_EQUUSV_IDENTITY_KEY

export default function ConfirmPinScreen() {
    const insets = useSafeAreaInsets()
    const [pin, setPin] = useState<string[]>([])
    const shakeAnim = useRef(new Animated.Value(0)).current
    const router = useRouter()
    const { setWallet } = useWallet()
    const [name, setName] = useState<{ firstName: string, lastName: string }>({ firstName: '', lastName: ''})

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start(() => setPin([]))
    }

    useEffect(() => {
        const matchPin = async () => {
            if (pin.length === 6) {
                console.log('matchPin called, pin length', pin.length)
                const enteredPin = await SecureStore.getItemAsync('pin')
                const pinStr = pin.join('')

                if (enteredPin === pinStr) {
                    console.log('PIN correct')
                    try {
                        const wallet = await loadWallet()
                        console.log('wallet loaded', wallet !== null)
                        if (!wallet) {
                            Alert.alert('Fel', 'Kunde inte ladda arkivet.')
                            return
                        }

                        console.log('About to aquireCertificate')
                        const cert = await wallet?.acquireCertificate({
                            type: CERT_TYPE_HORSE_OWNER,
                            certifier: EQUUSV_IDENTITY_KEY!,
                            acquisitionProtocol: 'issuance',
                            fields: { 
                                role: 'equusv-horse-owner',
                                firstName: name.firstName,
                                lastName: name.lastName
                            },
                            certifierUrl: `${TOKEN_SERVER_URL}/certify/horse-owner`
                        })
                        console.log('certificate acquired:', JSON.stringify(cert))
                        
                        setWallet(wallet)
                        router.replace('/home')
                        
                    } catch (error) {
                        // Alert.alert('Fel', 'Ingen internetanslutning. Försök igen.')
                        console.log('ConfirmPin error:', error)
                        Alert.alert('Fel', String(error))
                    }
                } else {
                    shake()
                }
            }
        }
        matchPin()
    }, [pin])

    const handlePress = (num: string): void => {
        if (pin.length < 6) setPin([...pin, num])
    }

    const handleBackSpace = () => {
        setPin(pin.slice(0, -1))
    }

    return (
            <View style={styles.container}>
                <View style={[styles.header, { top: insets.top + 8 }]}>
                    <BackButton emptyPin={true} color='#1b1b1b' />
                </View>
                <View style={[styles.heading, { top: insets.top + 72 }]}>
                    <Text style={styles.title}>Bekräfta din PIN-kod</Text>
                </View>
                <View style={styles.outerDotContainer}>
                    <Animated.View style={[styles.innerDotContainer, { transform: [{ translateX: shakeAnim }]}]}>
                        {Array.from({ length: 6 }).map((_, i) => (
                        <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
                        ))}
                    </Animated.View>
                </View>
                <View style={styles.numberMainContainer}>
                    <View style={styles.numberRow}>
                        {['1', '2', '3'].map((num, i) => (
                            <TouchableOpacity onPress={() => handlePress(num)} key={num} style={styles.numberContainer}>
                                <Text style={styles.number}>{num}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.numberRow}>
                        {['4', '5', '6'].map((num, i) => (
                            <TouchableOpacity onPress={() => handlePress(num)} key={num} style={styles.numberContainer}>
                                <Text style={styles.number}>{num}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.numberRow}>
                        {['7', '8', '9'].map((num, i) => (
                            <TouchableOpacity onPress={() => handlePress(num)} key={num} style={styles.numberContainer}>
                                <Text style={styles.number}>{num}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.numberRowZero}>
                            <TouchableOpacity onPress={() => handlePress('0')} style={styles.numberContainer}>
                                <Text style={styles.number}>0</Text>
                            </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={handleBackSpace} style={styles.backArrow}>
                        <Ionicons name="backspace-sharp" size={48} color="#1b1b1b" />
                    </TouchableOpacity>
                </View>
            </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F0EB',
    },
    header: {
        position: 'absolute',
        left: 0,
        paddingHorizontal: 24,
    },
    heading: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1b1b1b',
        letterSpacing: -0.2,
    },
    outerDotContainer: {
        position: 'absolute',
        top: '25%',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    innerDotContainer: {
        flexDirection: 'row',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#b8ab9e',
        margin: 6,
    },
    dotFilled: {
        backgroundColor: '#1b1b1b',
        borderColor: '#1b1b1b',
    },
    numberMainContainer: {
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: [{ translateX: '-50%' }],
    },
    numberRow: {
        flexDirection: 'row',
    },
    numberContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EAE1D8',
    },
    numberRowZero: {
        alignItems: 'center',
    },
    number: {
        fontFamily: 'Inter_300Light',
        fontSize: 22,
        color: '#1b1b1b',
    },
    backArrow: {
        position: 'absolute',
        top: '80%',
        left: '75%',
    },
})