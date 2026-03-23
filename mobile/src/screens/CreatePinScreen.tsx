import { StyleSheet, Text, View, ImageBackground, TouchableOpacity } from 'react-native'
import { useState, useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as SecureStore from 'expo-secure-store'
import { useRouter } from 'expo-router'

import Heading from '@/components/text/Heading'

export default function CreatePinScreen() {
    const insets = useSafeAreaInsets()
    const [pin, setPin] = useState<string[]>([])
    const router = useRouter()

    useEffect(() => {
        const checkPin = async () => {
            if (pin.length === 6) {
                const pinStr = pin.join('')
                await SecureStore.setItemAsync('pin', pinStr)
                router.push('/pin/confirm')
            }
        }
        checkPin()
    }, [pin])

    const handlePress = (num: string): void => {
        if (pin.length < 6) setPin([...pin, num])
    }

    const handleBackSpace = () => {
        setPin(pin.slice(0, -1))
    }

    return (
        <ImageBackground source={require('@/assets/images/horse-pin-screen.jpg')} style={styles.backgroundImage}>
            <View style={styles.overlay}/>
            <View style={[styles.heading, { top: insets.top + 72 }]}>
                <Heading>Skapa din PIN-kod</Heading>
            </View>
            <View style={styles.dotContainer}>
                {Array.from({ length: 6 }).map((_, i) => (
                <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
                ))}
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
    heading: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    dotContainer: {
        position: 'absolute',
        top: '25%',
        left: '50%',
        transform: [{ translateX: '-50%' }],
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
    }
})