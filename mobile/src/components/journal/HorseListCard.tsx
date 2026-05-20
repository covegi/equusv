import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import { useState, useEffect } from 'react'
import { fetchFromUhrp } from '@/utils/uhrp'
import type { HorsePassport } from '@/types/horse-passport'

export default function HorseListCard({ horse }: { horse: HorsePassport }) {
    const [image, setImage] = useState<string | null>()

    // useEffect(() => {
    //     const fetch = async () => {
    //         const fetchedImage = await fetchFromUhrp({ uhrpUrl })
    //         setImage(fetchedImage)
    //     } 
    //     fetch()
    // }, [])

    return (
        <TouchableOpacity style={styles.outerContainer}>
            <View>
                <View style={styles.placeholder}>
                    <Text>Placeholder</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.name}>{horse.name}</Text>
                    <Text style={styles.ueln}>{horse.ueln}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    outerContainer: {
        width: '100%',
        height: 230,
        backgroundColor: '#1a1a1a',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    placeholder: {
        height: 165,
        aspectRatio: 16/9,
        resizeMode: 'contain',
        backgroundColor: '#f7f2f2',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 2
    },
    textContainer: {
        marginTop: 6,
    },
    name: {
        fontFamily: 'Inter_600SemiBold',
        color: '#f7f2f2',
        fontSize: 20,
        paddingBottom: 2
    },
    ueln: {
        fontFamily: 'Inter_300Light',
        color: '#f7f2f2',
        fontSize: 12
    }
})