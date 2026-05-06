import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Animated, Image, Alert } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as SecureStore from 'expo-secure-store'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useWallet } from '@/context/WalletContext'
import { loadWallet } from '@/utils/wallet'

import PrimaryButton from '@/components/buttons/PrimaryButton'

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
                        router.replace('/horses')
                    } else {
                        Alert.alert('Fel', 'Kunde inte ladda arkivet.')
                        }
                    } catch (error) {
                        Alert.alert('Fel', 'Ingen internetanslutning. Försök igen.')
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
            await SecureStore.deleteItemAsync('horseUelns')
            router.replace('/')
        }

    return (
        <ImageBackground source={require('@/assets/images/horse-pin-screen.jpg')} style={styles.backgroundImage}>
            <View style={styles.overlay}/>
            <View style={[styles.logoContainer, { top: insets.top }]}>
                    <Image source={require('@/assets/images/logo_transparent.png')} style={{ width: 200, height: 200 }} resizeMode='contain' />
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
                    <Ionicons name="backspace-sharp" size={48} color="#f7f2f2" />
                </TouchableOpacity>
            </View>
             <View style={styles.container}>
                <PrimaryButton onPress={handleDeleteSecureStore}>Rensa SecureStore</PrimaryButton>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    logoContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
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
        borderColor: '#f7f2f2',
        margin: 6
    },
    dotFilled: {
        backgroundColor: '#f7f2f2'
    },
    numberMainContainer: {
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: [{ translateX: '-50%'}],
    },
    numberRow: {
        flexDirection: 'row'
    },
    numberContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f7f2f2',
    },
    numberRowZero: {
        alignItems: 'center'
    },
    number: {
        fontFamily: 'Inter_300Light',
        fontSize: 22,
        color: '#f7f2f2'
    },
    backArrow: {
        position: 'absolute',
        top: '80%',
        left: '75%'
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        margin: 60
    }
})