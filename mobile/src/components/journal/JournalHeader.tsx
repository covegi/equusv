import { StyleSheet, View, Text, Image } from "react-native"
import type { HorsePassport } from "@/types/horse-passport"
import Entypo from '@expo/vector-icons/Entypo';

export default function JournalHeader({ horse, horseImage }: {horse: Partial<HorsePassport>, horseImage?: string}) {

    return (
        <View style={styles.outerContainer}>
            <Image source={{ uri: horseImage}} style={styles.thumbnail} resizeMode='cover' />
            <View style={styles.innerContainer}>
                <Text style={styles.name}>{horse.name}</Text>
                <Text style={styles.ueln}>{horse.ueln}</Text>
                <View style={styles.firstInnerRow}>
                    <Text style={styles.firstInnerRowText}>Född {horse.birthDate?.split(' ').pop() ?? '_'}</Text>
                    <Entypo name="dot-single" size={14} color="#8a7267" style={styles.dot} />
                    <Text style={styles.firstInnerRowText}>{horse.sex}</Text>
                    <Entypo name="dot-single" size={14} color="#8a7267" style={styles.dot} />
                    <Text style={styles.firstInnerRowText}>{horse.breed}</Text>
                </View>
                    <Text style={styles.secondInnerRowText}>Ägare: {horse.ownerAtRegistration}</Text>
            </View>
            

        </View>
    )
}

const styles = StyleSheet.create({
    outerContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 12,
        marginTop: 6,
        gap: 12
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 10,
        backgroundColor: '#F5F0EB'
    },
    innerContainer: {
        flexDirection: 'column'
    },
    firstInnerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        color: '#8a7267'
        
    },
    name: {
        fontSize: 22,
        fontWeight: '600',
        color: '#1b1b1b'
    },
    ueln: {
        fontSize: 12,
        color: '#8a7267',
        marginTop: 2,
    },
    firstInnerRowText: {
        fontSize: 12,
        marginTop: 2,
        color: '#8a7267'
    },
    dot: {
        marginTop: 4
    },
    secondInnerRowText: {
        fontSize: 12,
        marginTop: 2,
        color: '#8a7267'
    }
})