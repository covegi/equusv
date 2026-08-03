import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Animated, Image, Alert } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useWallet } from '@/context/WalletContext'
import { loadWallet } from '@/utils/wallet'

export default function LoginScreen() {
    const insets = useSafeAreaInsets()
    const [pin, setPin] = useState<string[]>([])
    const shakeAnim = useRef(new Animated.Value(0)).current
    const router = useRouter()
    const { setWallet } = useWallet()

    useEffect(() => {
        if (pin.length === 6) {
            const check = async () => {
                const storedPin = await SecureStore.getItemAsync('pin')
                const pinStr = pin.join('')
                if (storedPin === pinStr) {
                    try {
                        const wallet = await loadWallet()
                        if (wallet !== null) {
                        setWallet(wallet)
                        router.replace('/home')
                    } else {
                        Alert.alert('Fel', 'Kunde inte ladda arkivet.')
                        }
                    } catch (error: any) {
                        console.log('Wallet load error', error.message, error.code)
                        if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
                            Alert.alert('Fel', 'Ingen internetanslutning. Försök igen.')
                        } else {
                            Alert.alert('Fel', `Oväntat fel: ${error.message}`)
                        } 
                    }
                    return
                }
                shake()
            }
            check()
        }
    }, [pin])

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start(() => setPin([]))
    }

    const handlePress = (num: string): void => {
        if (pin.length < 6) setPin([...pin, num])
    }

    const handleBackSpace = () => {
        setPin(pin.slice(0, -1))
    }

    const handleDeleteSecureStore = async () => {
        try {
            await SecureStore.deleteItemAsync('rootKeyHex')
            await SecureStore.deleteItemAsync('pin')
            await AsyncStorage.clear()
            const keys = await AsyncStorage.getAllKeys()
        } catch (error) {
            console.log('clear failed', error)
        }
        router.replace('/')
    }

    return (
        <View style={styles.container}>
            <View style={[styles.logoContainer, { top: insets.top + 60 }]}>
                    <Image
                        source={require('../../assets/images/equusv-icon-transparent-bg.png')}
                        style={styles.icon}
                        resizeMode='contain' />
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
             <TouchableOpacity onPress={handleDeleteSecureStore} style={[styles.devLink, { bottom: insets.bottom + 16 }]}>
                <Text style={styles.devLinkText}>Rensa SecureStore</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F0EB',
    },
    logoContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    icon: {
        width: 64,
        height: 64,
    },
    outerDotContainer: {
        position: 'absolute',
        top: '25%',
        left: '50%',
        transform: [{ translateX: '-50%' }],
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
    devLink: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    devLinkText: {
        fontSize: 11,
        color: '#8a7267',
        textDecorationLine: 'underline',
    },
})