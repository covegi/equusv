import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AntDesign from '@expo/vector-icons/AntDesign'
import { useWallet } from '@/context/WalletContext'
import { PushDrop, LockingScript } from '@bsv/sdk'
import * as SecureStore from 'expo-secure-store'

import HorseModal from '@/components/modal/HorseModal'
import Heading from '@/components/text/Heading'
import HorseJournal from '@/components/journal/HorseJournal'

import type { HorsePassport } from '@/types/horse-passport'

export default function MyHorsesScreen() {
    const [visible, setVisible] = useState(false)
    const insets = useSafeAreaInsets()
    const [horse, setHorse] = useState<HorsePassport[]>([])
    const { wallet } = useWallet()
    const [refresh, setRefresh] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
       const fetchHorses = async () => {
        setIsLoading(true)
        if (!wallet) {
            setIsLoading(false)
            return
        }   
        
       const uelns: string[] = JSON.parse(await SecureStore.getItemAsync('horseUelns') ?? '[]')

       if (uelns.length === 0) {
            setIsLoading(false)
            return
       }

       console.log('uelns:', uelns)

       const allOutputs = await Promise.all(
        uelns.map(ueln => wallet.listOutputs({
            basket: `equusv-${ueln}`,
            include: 'locking scripts',
        }))
       )
       console.log('allOutputs raw:', JSON.stringify(allOutputs))

        console.log('All outputs:', allOutputs)

        const outputs = allOutputs.flatMap(r => r.outputs)
        console.log('outputs[0]:', JSON.stringify(outputs[0]))
        console.log('lockingScript type:', typeof outputs[0]?.lockingScript)
        console.log('lockingScript value:', outputs[0]?.lockingScript)

        const horses: HorsePassport[] = outputs
            .filter(output => {
                return output.lockingScript && !output.lockingScript.startsWith('76a914')
            })
            .map(output => {
            const script = LockingScript.fromHex(output.lockingScript!)
            const { fields } = PushDrop.decode(script)

            const decode = (field: number[]) => Buffer.from(field).toString('utf-8')

            return {
                name: decode(fields[1]),
                breed: decode(fields[2]),
                birthDate: decode(fields[3]),
                sex: decode(fields[4]),
                color: decode(fields[5]),
                ueln: decode(fields[6]),
                chip: decode(fields[7]),
                ownerAtRegistration: decode(fields[8]),
                location: decode(fields[9]),
                organisation: decode(fields[10]),
                issuedDate: decode(fields[11]),
                foodChainStatus: decode(fields[12]) === 'true',
                photoUhrp: decode(fields[13]),
            } as HorsePassport
        })
        setHorse(horses)
        setIsLoading(false)
       }
       fetchHorses()
    }, [wallet, refresh])

    if (!wallet) return null
    
    return (
        <View style={styles.outerContainer}>
            <HorseModal 
                visible={visible} 
                onClose={() => setVisible(false)}
                onSaved={() => setRefresh(r => r + 1)}
            />
            <View style={[styles.headerContainer, { top: insets.top + 36 }]}>
                <Heading>Mina hästar</Heading>
            </View>
            <View style={styles.centerContainer}>
              {isLoading 
                ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                    <ActivityIndicator color='#C8963E' size="large" />
                    <Text style={styles.iconText}>Hämtar dina hästar... </Text>
                </View>
                : <FlatList 
                data={horse}
                renderItem={({ item }) => <HorseJournal horse={item} />}
                snapToInterval={590}
                decelerationRate='fast'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 50 }}
              />}
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
    },
})