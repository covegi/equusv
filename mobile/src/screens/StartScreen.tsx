import { StyleSheet, View, ImageBackground, Image } from "react-native"
import { router } from "expo-router"
import Heading from "@/components/text/Heading"
import BodyText from "@/components/text/BodyText"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import SecondaryButton from "@/components/buttons/SecondaryButton"

export default function StartScreen() {
    return (
        <ImageBackground source={require('@/assets/images/horse-start-screen.jpg')} style={styles.backgroundImage} imageStyle={{ right: -30 }}>
            <View style={styles.containerText}>
                <View style={styles.headerContainer}>
                    <Heading fontSize={48}>Equus</Heading>
                    <Image source={require('@/assets/images/equusv_orange_checkmark.png')} style={styles.image}></Image>
                </View>
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
    image: {
        position: 'absolute',
        left: 140,
        top: -7
    },
    containerText: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: '60%',
        paddingLeft: '10%'
    },
    headerContainer: {
        flexDirection: 'row',
    },
    containerButtons: {
        justifyContent: 'flex-end',
        paddingBottom: '30%'
    }
})