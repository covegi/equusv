import { StyleSheet, View, ImageBackground, Image } from "react-native"
import { useEffect } from "react"
import { router } from "expo-router"
import * as SecureStore from 'expo-secure-store'
import Heading from "@/components/text/Heading"
import BodyText from "@/components/text/BodyText"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import SecondaryButton from "@/components/buttons/SecondaryButton"

export default function StartScreen() {

    useEffect(() => {
        const check = async () => {
            const rootKeyHex = await SecureStore.getItemAsync('rootKeyHex')
            if (rootKeyHex) {
                router.replace('/login')
            }
        }
        check()
    }, [])

    return (
        <ImageBackground source={require('@/assets/images/horse-start-screen.jpg')} style={styles.backgroundImage} imageStyle={{ right: -30 }}>
            <View style={styles.containerText}>
                <Image 
                    source={require('@/assets/images/logo_transparent.png')} 
                    style={styles.logo}
                    resizeMode="contain"
                />
                <BodyText >Sanningen om din häst</BodyText>
            </View>
            <View style={styles.containerButtons}>
                <PrimaryButton onPress={() => router.push('/backup')}>Skapa arkiv</PrimaryButton>
                <SecondaryButton onPress={() => router.push('/restore')}>Återställ arkiv</SecondaryButton>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1
    },
    logo: {
        width: 220,
        height: 60,
    },
    containerText: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: '60%',
        paddingLeft: '10%'
    },
    containerButtons: {
        justifyContent: 'flex-end',
        paddingBottom: '30%'
    }
})