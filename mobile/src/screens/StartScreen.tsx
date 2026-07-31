import { StyleSheet, View, Text, Image, Dimensions, Pressable } from "react-native"
import { useEffect } from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { router } from "expo-router"
import * as SecureStore from 'expo-secure-store'
import PrimaryButton from "@/components/buttons/PrimaryButton"
import SecondaryButton from "@/components/buttons/SecondaryButton"

export default function StartScreen() {
    const insets = useSafeAreaInsets()

    useEffect(() => {
        const check = async () => {
            const rootKeyHex = await SecureStore.getItemAsync('rootKeyHex')
            if (rootKeyHex) {
                router.replace('/login')
            }
        }
        check()
    }, [])

    const { width } = Dimensions.get('window')

    return (
        <>
            <View style={styles.outerContainer}>
                <View style={styles.textBlock}>
                    <Image
                        source={require('@/assets/images/equusv-horse-icon.png')}
                        style={{ width: width * 0.13, height: width * 0.13 }}
                        resizeMode="contain"
                    />
                    <Image 
                        source={require('@/assets/images/EquusV_Inter_Regular_transparent.png')} 
                        style={{ width: width * 0.6, height: width * 0.6 * (60/220) }}
                        resizeMode="contain"
                    />
                        <Text style={styles.tagline}>SANNINGEN OM DIN HÄST</Text>
                        <Text style={styles.slogan}>Hela hästens liv i en journal</Text>
                        <Text style={styles.punchline}>All historik — spårbar, delbar, verifierad</Text>
                        <View style={styles.btnContainer}>
                    <Pressable onPress={() => router.push('/backup')} style={styles.primaryBtn}>
                        <Text style={styles.primaryBtnText}>Skapa nytt arkiv</Text>
                    </Pressable>
                    <Pressable onPress={() => {}} hitSlop={10}>
                        <Text style={{ color: '#1b1b1b'}}>Så funkar det</Text>
                    </Pressable>
               </View>
               </View>
                <View style={[styles.restore, { paddingBottom: insets.bottom + 24 }]}>
                    <Pressable onPress={() => router.push('/restore')} hitSlop={10}>
                            <Text style={styles.restoreText}>Återställ arkiv</Text>
                    </Pressable>
                </View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#F5F0EB',
    },
    textBlock: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 34,
    },
    tagline: {
        fontSize: 11,
        fontWeight: '400',
        color: '#574238',
        letterSpacing: 2,
        marginTop: 8,
    },
    slogan: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1b1b1b',
        letterSpacing: -0.2,
        marginTop: 40,
        textAlign: 'center',
    },
    punchline: {
        fontSize: 13,
        fontWeight: '400',
        color: '#574238',
        marginTop: 12,
        textAlign: 'center',
    },
    btnContainer: {
        alignSelf: 'stretch',
        alignItems: 'center',
        marginTop: 40,
        gap: 18,
    },
    primaryBtn: {
        backgroundColor: '#1b1b1b',
        paddingVertical: 12,
        paddingHorizontal: 14,
        alignItems: 'center',
        borderRadius: 8
    },
    primaryBtnText: {
        color: '#f9f9f9',             
        fontSize: 14,
        fontWeight: '600',
    },
    secondaryBtn: {
        color: '#1b1b1b',
        fontSize: 14,
        fontWeight: '400',
    },
    restore: {
        alignItems: 'center'
    },
    restoreText: {
        color: '#8a7267',
        fontSize: 13.5,
        fontWeight: '400',
    },
})