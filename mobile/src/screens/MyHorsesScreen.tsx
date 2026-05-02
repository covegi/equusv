import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Animated } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AntDesign from '@expo/vector-icons/AntDesign'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { useWallet } from '@/context/WalletContext'
import { PushDrop, LockingScript } from '@bsv/sdk'
import * as SecureStore from 'expo-secure-store'
import { useRouter } from 'expo-router'

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
    const [menuVisible, setMenuVisible] = useState(false)
    const slideAnim = useRef(new Animated.Value(300)).current
    const router = useRouter()

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

    const openMenu = () => {
        setMenuVisible(true)
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true
        }).start()
    }

    const closeMenu = () => {
        Animated.timing(slideAnim, {
            toValue: 500,
            duration: 350,
            useNativeDriver: true
        }).start(() => setMenuVisible(false))
    }

    const menyItems = [
        { label: 'Hästpass', onPress: () => router.push('/passport') }
    ]
    
    return (
        <View style={styles.outerContainer}>
            <HorseModal 
                visible={visible} 
                onClose={() => setVisible(false)}
                onSaved={() => setRefresh(r => r + 1)}
            />
            {menuVisible && 
                <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }]}]}>
                    <View style={styles.closeIconContainer}>
                        <TouchableOpacity
                            onPress={closeMenu}
                            style={[styles.closeIcon]}>
                            <AntDesign name="close" size={24} color="#1a1a1a" />
                        </TouchableOpacity>
                        <Text style={styles.menuText}>Aktiviteter</Text>
                    </View>
                    {menyItems.map(item => (
                        <TouchableOpacity onPress={item.onPress} key={item.label}>
                            <View style={styles.listItemContainer}>
                                <FontAwesome6 name="passport" size={30} color="#1a1a1a" />
                                {<Text style={styles.listItemText}>{item.label}</Text>}
                            </View>
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            }
            
            <View style={styles.mainHeaderContainer}>
                <View style={[styles.headerContainer, { top: insets.top + 36 }]}>
                    <Heading>Mina hästar</Heading>
                </View>
                <TouchableOpacity onPress={openMenu}>
                    <View style={[styles.hamburgerContainer, { top: insets.top + 12 }]}>
                        <AntDesign name="menu" size={24} color="#f7f2f2" />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={[styles.centerContainer, { top: insets.top }]}>
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
    menuContainer: {
        height: '100%',
        width: '100%',
        position: 'absolute',
        backgroundColor: '#f7f2f2',
        zIndex: 15
    },
    closeIconContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    closeIcon: {
        justifyContent: 'flex-start',
        paddingLeft: 25,
        paddingTop: 60,
        marginBottom: 20
    },
    menuText: {
        color: '#1a1a1a',
        fontFamily: 'Inter_600SemiBold',
        fontSize: 24,
        paddingTop: 40,
        paddingLeft: 10
    },
    mainHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
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
        fontFamily: 'Inter_300Light',
        fontSize: 12,
        color: '#f7f2f2'
    },
    listItemContainer: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 25
    },
    listItemText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 18,
        paddingLeft: 20
    }
})