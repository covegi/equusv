import { StyleSheet, Text, View } from "react-native"

export default function ConfirmPinScreen() {
    return (
        <View style={styles.container}>
            <Text>confirm Pin</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})