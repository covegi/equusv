import { StyleSheet, View } from "react-native"
import { ImageBackground } from "react-native"
import { router } from "expo-router"
import Heading from "@/components/text/Heading"
import BodyText from "@/components/text/BodyText"
import PrimaryButton from "@/components/buttons/PrimaryButton"
import SecondaryButton from "@/components/buttons/SecondaryButton"

export default function StartScreen() {
    return (
        <ImageBackground source={require('@/assets/images/horse-start-screen.jpg')} style={styles.image} imageStyle={{ right: -25 }}>
            <View style={styles.containerText}>
                <Heading fontSize={48}>EquusCert</Heading>
                <BodyText >Sanningen om din häst</BodyText>
            </View>
            <View style={styles.containerButtons}>
                <PrimaryButton onPress={() => router.push('/backup')}>Skapa plånbok</PrimaryButton>
                <SecondaryButton onPress={() => router.push('/restore')}>Återställ plånbok</SecondaryButton>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    image: {
        flex: 1
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