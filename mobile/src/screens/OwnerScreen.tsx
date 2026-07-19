import { StyleSheet, Text, View, FlatList, ActivityIndicator, Modal, Alert } from 'react-native'
import { useState, useEffect, useMemo } from 'react'
import { useWallet } from '@/context/WalletContext'
import { PushDrop, LookupResolver, Transaction, AuthFetch } from '@bsv/sdk'
import * as SecureStore from 'expo-secure-store'
import { createMessageBoxClient, MESSAGE_BOXES, MESSAGEBOX_HOST } from '@/utils/messageBox'

import HorseListCard from '@/components/journal/HorseListCard'
import type { HorsePassport } from '@/types/horse-passport'
import { fetchFromUhrp } from '@/utils/uhrp'
import HorseJournal from '@/components/journal/HorseJournal'
import Header from '@/components/header/header'
import { HorsePassportRecord } from '@/types/horse-passport-record'
import DrawerMenu from '@/components/navigation/DrawerMeny'

const TOKEN_SERVER_URL = process.env.EXPO_PUBLIC_TOKEN_SERVER_URL

export default function OwnerScreen() {
    const [horse, setHorse] = useState<HorsePassport[]>([])
    const [horseDraft, setHorseDraft] = useState<HorsePassportRecord[]>([])
    const { wallet } = useWallet()
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingImage, setIsLoadingImage] = useState<Record<string, boolean>>({})
    const [horseImage, setHorseImage] = useState<Record<string, string>>({})
    const [selectedRecord, setSelectedRecord] = useState<HorsePassportRecord | null>(null)
    const [showCreateNewPassport, setCreateNewPassport] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const [drawerVisible, setDrawerVisible] = useState(false)

    const authFetch = useMemo(() =>
        wallet ? new AuthFetch(wallet) : null
    , [wallet])

    useEffect(() => {
        if (horse.length === 0) return
        
        let cancelled = false

        const fetchImages = async () => {
            await Promise.all(horse.map( async (h) => {
                if (cancelled || !h.ueln) return
                setIsLoadingImage(prev => ({...prev, [h.id]: true})) 
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

                        const cdnUrl = Buffer.from(Array.from(foundDecoded.fields[8]) as number[]).toString('utf-8')
                        const mimeType = Buffer.from(Array.from(foundDecoded.fields[4]) as number[]).toString('utf-8')
                        // const tx = Transaction.fromBEEF(beef)
                        // const { fields } = PushDrop.decode(tx.outputs[outputIndex].lockingScript)
                        // const cdnUrl = Buffer.from(fields[8]).toString('utf-8')
                        // const mimeType = Buffer.from(fields[4]).toString('utf-8')
                        const dataUri = await fetchFromUhrp({ cdnUrl, mimeType })
                        console.log('dataUri:', dataUri)
                        if (!cancelled && dataUri) setHorseImage(prev => ({...prev, [h.id]: dataUri}))
                        console.log('horseImage:', horseImage)
                    }
                } catch (error) {
                    console.error(error)
                } finally {
                    setIsLoadingImage(prev => ({...prev, [h.id]: false}))
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

        // Local data from SecureStore

        const stored = await SecureStore.getItemAsync('draftIds')
        const ids = stored ? JSON.parse(stored) : []
        const drafts: HorsePassportRecord[] = []
        for (const id of ids) {
            const raw = await SecureStore.getItemAsync(`passport-draft-${id}`)
            if (raw) drafts.push(JSON.parse(raw))
        }
        
    //    const uelns: string[] = JSON.parse(await SecureStore.getItemAsync('horseUelns') ?? '[]')

    //    if (uelns.length === 0) {
    //         setIsLoading(false)
    //         return
    //    }

    //    console.log('uelns:', uelns)

    //    const allOutputs = await Promise.all(
    //     uelns.map(ueln => wallet.listOutputs({
    //         basket: `equusv-${ueln}`,
    //         include: 'locking scripts',
    //     }))
    //    )

    //     const outputs = allOutputs.flatMap(r => r.outputs)

    //     const horses: HorsePassport[] = outputs
    //         .filter(output => {
    //             return output.lockingScript && !output.lockingScript.startsWith('76a914')
    //         })
    //         .map(output => {
    //         const script = LockingScript.fromHex(output.lockingScript!)
    //         const { fields } = PushDrop.decode(script)

    //         const decode = (field: number[]) => Buffer.from(field).toString('utf-8')

        //     return {
        //         name: decode(fields[1]),
        //         breed: decode(fields[2]),
        //         birthDate: decode(fields[3]),
        //         sex: decode(fields[4]),
        //         color: decode(fields[5]),
        //         ueln: decode(fields[6]),
        //         chip: decode(fields[7]),
        //         ownerAtRegistration: decode(fields[8]),
        //         location: decode(fields[9]),
        //         organisation: decode(fields[10]),
        //         issuedDate: decode(fields[11]),
        //         foodChainStatus: decode(fields[12]) === 'true',
        //     } as HorsePassport
        // })
        setHorseDraft(drafts)
        console.log('Loaded drafts:', drafts.length, JSON.stringify(drafts))
        setIsLoading(false)
       }
       fetchHorses()
    }, [wallet, refreshKey])

    if (!wallet) return null

    const handlePhotoUploaded = (ueln: string, dataUri: string) => {
        console.log('handlePhotoUploaded called:', ueln, dataUri.substring(0, 50))
        setHorseImage(prev => ({ ...prev, [ueln]: dataUri }))
    }

    const clearAll = async () => {
        const stored = await SecureStore.getItemAsync('horseUelns')
        const uelns: string[] = stored ? JSON.parse(stored) : []
        
        for (const ueln of uelns) {
            await SecureStore.deleteItemAsync(`passport-draft-${ueln}`)
        }
        
        await SecureStore.deleteItemAsync('horseUelns')
        Alert.alert('Rensat', 'All lokal data borttagen')
    }

    const deleteRecord = async (id: string) => {
        console.log('deleteRecord called with id:', id)
        await SecureStore.deleteItemAsync(`passport-draft-${id}`)

        const stored = await SecureStore.getItemAsync('draftIds')
        const ids: string[] = stored ? JSON.parse(stored) : []
        await SecureStore.setItemAsync('draftIds', JSON.stringify(ids.filter(i => i !== id)))

        setSelectedRecord(null)
        setRefreshKey(prev => prev + 1)
    }

    const sendToBreedingOrg = async ( record: HorsePassportRecord ) => {
        if (!authFetch) return
        const submittedAt = new Date().toISOString()

        try {
            const response = await authFetch?.fetch(`${TOKEN_SERVER_URL}/identity/passport/create`, {
                method: 'POST',
                headers: { 'content-type': 'application/json'},
                body: JSON.stringify({
                  record: { ...record, status: 'pending', submittedAt: submittedAt},
                  identityKey: wallet!.identityKey  
                })
            })
            
            const data = await response.json()
            console.log('Response:', data.txid, data.outputIndex)

            const { tx: txBase64, txid, outputIndex } = data
            const tx = Array.from(Buffer.from(txBase64, 'base64'))

            await wallet.internalizeAction({
                tx,
                outputs: [{
                    outputIndex,
                    protocol: 'basket insertion',
                    insertionRemittance: {
                        basket: `equusv-${record.horse.id}`,
                        customInstructions: JSON.stringify({ type: 'horse-passport'}),
                        tags: ['passport']
                    }
                }],
                description: `pending passport: ${record.horse.name}`
            })
            
            console.log('Internalized:', txid)

            const raw = await SecureStore.getItemAsync(`passport-draft-${record.horse.id}`)
            if (raw) {
                const draft = JSON.parse(raw)
                draft.status = 'pending'
                draft.submittedAt = submittedAt
                await SecureStore.setItemAsync(`passport-draft-${record.horse.id}`, JSON.stringify(draft))
            }
            setSelectedRecord(null)
            setRefreshKey(prev => prev + 1)
        
        } catch (error) {
            console.error('sendToBreedingOrg failed', error)
            Alert.alert('Fel', 'Kunde inte hitta ansökan')
        }
    }

    const fetchRevisions = async () => {
        console.log('fetchRevisions called')
        if (!wallet) {
            console.log('No wallet')
            return
        }

        try {
            console.log('Creating MessageBoxClient...')
            const msgBox = await createMessageBoxClient(wallet)
            console.log('MessageBoxClient created')
            console.log('listing messages')
            const messages = await msgBox.listMessagesLite({
                messageBox: MESSAGE_BOXES.revisions,
                host: MESSAGEBOX_HOST
            })
            console.log('Revision messages:', messages.length)

            for (const msg of messages) {
                const body = typeof msg.body === 'string' ? JSON.parse(msg.body) : msg.body
                console.log('Message:', body.horseId, body.comment)
                if (body.type !== 'revision') continue

                const raw = await SecureStore.getItemAsync(`passport-draft-${body.horseId}`)
                if (raw) {  
                    const draft = JSON.parse(raw)
                    draft.status = 'revision'
                    draft.revisionComment = body.comment ?? ''
                    await SecureStore.setItemAsync(`passport-draft-${body.horseId}`, JSON.stringify(draft))
                }
             }

             if (messages.length > 0) {
                await msgBox.acknowledgeMessage({
                    messageIds: messages.map(m => m.messageId)
                })

                if (selectedRecord?.horse?.id) {
                    const raw = await SecureStore.getItemAsync(`passport-draft-${selectedRecord.horse.id}`)
                    if (raw) {
                        setSelectedRecord(JSON.parse(raw))
                    }
                }
                setRefreshKey(prev => prev + 1)
             }
        } catch (error: any) {
            console.error('Failed:', error?.message)
            console.error('Full error:', JSON.stringify(error, null, 2))
        }
    }
    
    return (
            <View style={styles.outerContainer}>
                <Header
                    onHorseCreated={() => setRefreshKey(prev => prev + 1)}
                    onMenuPress={() => setDrawerVisible(true)}
                />
                <View style={[styles.centerContainer]}>
                {isLoading 
                    ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                        <ActivityIndicator color='#8a7267' size="large" />
                        <Text style={styles.iconText}>Hämtar dina hästar... </Text>
                    </View>
                    : <FlatList 
                    data={horseDraft}
                    extraData={horseImage}
                    renderItem={({ item }) => 
                        <HorseListCard 
                            horse={item.horse}
                            onSpend={() => clearAll()}
                            horseImage={item.horse.id ? horseImage[item.horse.id] : null}
                            onPhotoUploaded={handlePhotoUploaded}
                            isLoadingImage={item.horse.id ? isLoadingImage[item.horse.id] : false}
                            onPress={() => setSelectedRecord(item)}    
                        />
                    }
                    showsVerticalScrollIndicator={false}

                    contentContainerStyle={{ paddingTop: 20, paddingBottom: 50 }}
                />}
                </View>
                <Modal visible={!!selectedRecord} animationType='slide' presentationStyle='pageSheet'>
                    <HorseJournal 
                        record={selectedRecord}
                        horseImage={horseImage[selectedRecord?.horse?.id ?? '']}
                        onClose={() => setSelectedRecord(null)}
                        onDelete={deleteRecord}
                        onSend={sendToBreedingOrg}
                        onRefresh={fetchRevisions}
                    />
                </Modal>
                <DrawerMenu
                    visible={drawerVisible}
                    onClose={() => setDrawerVisible(false)}
                />
        </View>
    )
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#F5F0EB',
        position: 'relative'
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
    },
})