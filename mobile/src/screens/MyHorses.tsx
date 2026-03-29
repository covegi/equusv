import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AntDesign from '@expo/vector-icons/AntDesign'
import * as SecureStore from 'expo-secure-store'
import { useRouter } from 'expo-router'

import HorseModal from '@/components/modal/HorseModal'
import Heading from '@/components/text/Heading'
import HorseJournal from '@/components/journal/HorseJournal'

import type { Horse } from '@/types/horse'

const horses: Horse[] = [
    {
        name: 'Molly',
        breed: 'Svenskt Varmblod',
        birthDate: '12 mars 2018',
        sex: 'Sto',
        color: 'Brun',
        ueln: '752182102048213',
        chip: '752098100123456',
        owner: 'Peter de Michiel',
        location: 'Anneberg',
        organisation: 'Svenska Varmblodssällskapet',
        issuedDate: '15 september 2018',
        foodChainStatus: 'Ingår ej',
    },
    {
        name: 'Storm',
        breed: 'Arabiskt Fullblod',
        birthDate: '3 juni 2015',
        sex: 'Valack',
        color: 'Grå',
        ueln: '752182102048999',
        chip: '752098100199999',
        owner: 'Anna Svensson',
        location: 'Stockholm',
        organisation: 'Svenska Arabsällskapet',
        issuedDate: '10 oktober 2015',
        foodChainStatus: 'Ingår ej',
    },
]

export default function MyHorses() {
    const [visible, setVisible] = useState(false)
    const insets = useSafeAreaInsets()
    const router = useRouter()
    
    return (
        <View style={styles.outerContainer}>
            <HorseModal visible={visible} onClose={() => setVisible(false)} />
            <View style={[styles.headerContainer, { top: insets.top + 36 }]}>
                <Heading>Mina hästar</Heading>
            </View>
            <View style={styles.centerContainer}>
              <FlatList 
                data={horses}
                renderItem={({ item }) => <HorseJournal horse={item} />}
                snapToInterval={580}
                decelerationRate='fast'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 50 }}
              />
            </View>
            <View style={[styles.footerContainer, { bottom: insets.bottom }]}>
                <TouchableOpacity onPress={() => setVisible(true)}>
                    <View style={styles.iconContainer}>
                        <AntDesign name="file-add" size={24} color="#f7f2f2" />
                        <Text style={styles.iconText}>Ny häst</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    headerContainer: {
        height: 120,
        marginLeft: 15,
    },
    centerContainer: {
        flex: 1,
        marginHorizontal: 15,
        justifyContent: 'flex-start',
    },
    footerContainer: {
        height: 70,
        backgroundColor: '#1a1a1a',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    iconContainer: {
        marginTop: 20,
        alignItems: 'center',
        gap: 8
    },
    iconText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: '#f7f2f2'
    }
})