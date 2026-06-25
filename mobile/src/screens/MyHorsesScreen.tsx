import { StyleSheet, Text, View, FlatList, ActivityIndicator, Modal } from 'react-native'
import { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { PushDrop, LockingScript, LookupResolver, Transaction } from '@bsv/sdk'
import * as SecureStore from 'expo-secure-store'

import HorseListCard from '@/components/journal/HorseListCard'
import type { HorsePassport } from '@/types/horse-passport'
import { fetchFromUhrp } from '@/utils/uhrp'
import HorseJournal from '@/components/journal/HorseJournal'

export default function MyHorsesScreen() {
    const [horse, setHorse] = useState<HorsePassport[]>([])
    const { wallet } = useWallet()
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingImage, setIsLoadingImage] = useState<Record<string, boolean>>({})
    const [horseImage, setHorseImage] = useState<Record<string, string>>({})
    const [selectedHorse, setSelectedHorse] = useState<HorsePassport | null>(null)

    useEffect(() => {
        if (horse.length === 0) return
        
        let cancelled = false

        const fetchImages = async () => {
            await Promise.all(horse.map( async (h) => {
                if (cancelled || !h.ueln) return
                setIsLoadingImage(prev => ({...prev, [h.ueln]: true})) 
                try {
                    const resolver = new LookupResolver({
                        hostOverrides: {
                            'ls_uhrp': ['https://chooser-crimp-recast.ngrok-free.dev']
                        }
                    })
                    console.log('lookup query:', { ueln: h.ueln, tokenType: 'photo' })
                    const answer = await resolver.query({
                        service: 'ls_uhrp',
                        query: { ueln: h.ueln, tokenType: 'photo'}
                    })
                    console.log('answer:', JSON.stringify(answer))

                    if (answer.type === 'output-list' && answer.outputs.length > 0) {

                        let foundDecoded: any = null
                        let latestDate = ''
                        for (let i = answer.outputs.length - 1; i >= 0; i--) {
                        const { beef, outputIndex } = answer.outputs[i]
                        const tx = Transaction.fromBEEF(beef)
                        const decoded = PushDrop.decode(tx.outputs[outputIndex].lockingScript)
                        const maybeCdn = Buffer.from(Array.from(decoded.fields[8] || [])).toString('utf-8')
                        if (maybeCdn.startsWith('https://')) {
                            const createdAt = Buffer.from(Array.from(decoded.fields[6]) || []).toString('utf-8')
                                if (createdAt > latestDate) {
                                    latestDate = createdAt
                                    foundDecoded = decoded
                                }
                            }
                        }
                        if (!foundDecoded) return  // ingen output med cdnUrl

                        const cdnUrl = Buffer.from(Array.from(foundDecoded.fields[8])).toString('utf-8')
                        const mimeType = Buffer.from(Array.from(foundDecoded.fields[4])).toString('utf-8')
                        // const tx = Transaction.fromBEEF(beef)
                        // const { fields } = PushDrop.decode(tx.outputs[outputIndex].lockingScript)
                        // const cdnUrl = Buffer.from(fields[8]).toString('utf-8')
                        // const mimeType = Buffer.from(fields[4]).toString('utf-8')
                        const dataUri = await fetchFromUhrp({ cdnUrl, mimeType })
                        console.log('dataUri:', dataUri)
                        if (!cancelled && dataUri) setHorseImage(prev => ({...prev, [h.ueln]: dataUri}))
                        console.log('horseImage:', horseImage)
                    }
                } catch (error) {
                    console.error(error)
                } finally {
                    setIsLoadingImage(prev => ({...prev, [h.ueln]: false}))
                }
            }))
        }
        fetchImages()
        return () => { cancelled = true }
    }, [horse])

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

    const handlePhotoUploaded = (ueln: string, dataUri: string) => {
        console.log('handlePhotoUploaded called:', ueln, dataUri.substring(0, 50))
        setHorseImage(prev => ({ ...prev, [ueln]: dataUri }))
    }
    
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
                    extraData={horseImage}
                    renderItem={({ item }) => 
                        <HorseListCard 
                            horse={item}
                            horseImage={horseImage[item.ueln] ?? null}
                            onPhotoUploaded={handlePhotoUploaded}
                            isLoadingImage={isLoadingImage[item.ueln] ?? false}
                            onPress={(horse) => setSelectedHorse(horse)}    
                        />
                            
                    }
                    showsVerticalScrollIndicator={false}

                    contentContainerStyle={{ paddingTop: 20, paddingBottom: 50 }}
                />}
                </View>
                <Modal visible={!!selectedHorse} animationType='slide' presentationStyle='pageSheet'>
                    <HorseJournal 
                        horse={selectedHorse}
                        horseImage={horseImage[selectedHorse?.ueln ?? '']}
                        onClose={() => setSelectedHorse(null)}
                    />
                </Modal>
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