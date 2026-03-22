import { StyleSheet, Text, View, Dimensions } from 'react-native'

export default function MnemonicWord({ children, boxNumber=1 }: { children: string, boxNumber?: number }) {
    const { width } = Dimensions.get('window')
    const boxWidth = (width - 60) / 3
    const boxHeight = width * 0.15

    return (
        <View style={[styles.container, { width: boxWidth, height: boxHeight }]}>
            <Text style={styles.boxNumber}>{boxNumber}.</Text>
            <View style={styles.wordWrapper}>
                <Text style={styles.word}>{children}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f7f2f2',
        borderRadius: 8,
        marginTop: 5,
        shadowColor: '#1a1a1a',
        shadowOffset: { width: 0, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 8,
        flexDirection: 'column'
    },
    boxNumber: {
        fontFamily: 'Inter_300Light',
        fontSize: 10,
        color: '#1a1a1a',
        position: 'absolute',
        top: 5,
        left: 7
    },
    wordWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    word: {
        fontFamily: 'Inter_400Regular',
        fontSize: 18,
        textAlign: 'center',
    }
})