import { StyleSheet, Text, View, FlatList, ActivityIndicator, Animated } from 'react-native'
import { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { PushDrop, LockingScript } from '@bsv/sdk'
import * as SecureStore from 'expo-secure-store'

import HorseListCard from '@/components/journal/HorseListCard'
import type { HorsePassport } from '@/types/horse-passport'

export default function MyHorsesScreen() {
    const [horse, setHorse] = useState<HorsePassport[]>([])
    const { wallet } = useWallet()
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

        const outputs = allOutputs.flatMap(r => r.outputs)


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
            } as HorsePassport
        })
        setHorse(horses)
        setIsLoading(false)
       }
       fetchHorses()
    }, [wallet])

    if (!wallet) return null
    
    return (
            <View style={styles.outerContainer}>
            <View style={[styles.centerContainer]}>
              {isLoading 
                ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                    <ActivityIndicator color='#C8963E' size="large" />
                    <Text style={styles.iconText}>Hämtar dina hästar... </Text>
                </View>
                : <FlatList 
                data={horse}
                renderItem={({ item }) => <HorseListCard key={item.ueln} horse={item} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 50 }}
              />}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        position: 'relative'
    },
    hamburgerContainer: {
        marginRight: 25
    },
    headerContainer: {
        height: 120,
        marginLeft: 15,
    },
    centerContainer: {
        flex: 1,
        paddingHorizontal: 25,
        justifyContent: 'flex-start',
    },
    iconText: {
        fontFamily: 'Inter_300Light',
        fontSize: 12,
        color: '#f7f2f2'
    }
})