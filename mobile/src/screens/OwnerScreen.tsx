import { StyleSheet, Text, View, FlatList, ActivityIndicator, Modal, Alert } from 'react-native'
import { useState, useEffect, useMemo } from 'react'
import { useWallet } from '@/context/WalletContext'
import { PushDrop, LookupResolver, Transaction, AuthFetch, LockingScript, walletErrors } from '@bsv/sdk'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createMessageBoxClient, MESSAGE_BOXES, MESSAGEBOX_HOST } from '@/utils/messageBox'
import { PASSPORT_BASKET, tagHorse, TAG_STATUS_PENDING, TAG_STATUS_ACTIVE } from '../constants/baskets'

import HorseListCard from '@/components/journal/HorseListCard'
import type { HorsePassport } from '@/types/horse-passport'
import { isPassportStatus, type HorsePassportRecord } from '@/types/horse-passport-record'
import { fetchFromUhrp } from '@/utils/uhrp'
import HorseJournal from '@/components/journal/HorseJournal'
import Header from '@/components/header/header'
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
    const [activeRecords, setActiveRecords] = useState<HorsePassportRecord[]>([])

    const [refreshKey, setRefreshKey] = useState(0)
    const [drawerVisible, setDrawerVisible] = useState(false)

    const authFetch = useMemo(() =>
        wallet ? new AuthFetch(wallet) : null
    , [wallet])

    const listData = useMemo(() => {
        const map = new Map<string, HorsePassportRecord>()
        for (const r of horseDraft) if (r.horse.id) map.set(r.horse.id, r)
        for (const r of activeRecords) if (r.horse.id) map.set(r.horse.id, r)
        return Array.from(map.values())
    }, [horseDraft, activeRecords])

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

        const stored = await SecureStore.getItemAsync('draftIds')
        const ids = stored ? JSON.parse(stored) : []
        const drafts: HorsePassportRecord[] = []
        for (const id of ids) {
            const raw = await SecureStore.getItemAsync(`passport-draft-${id}`)
            if (raw) drafts.push(JSON.parse(raw))
        }
        
        setHorseDraft(drafts)
        console.log('Loaded drafts:', drafts.length, JSON.stringify(drafts))
        setIsLoading(false)
       }
       fetchHorses()
    }, [wallet, refreshKey])

    useEffect(() => {
        if (!wallet) return

        const run = async () => {
            // await wallet.reviewSpendableOutputs(true, true)
            await fetchActivePasses()
            await fetchActive()
            const key = await SecureStore.getItemAsync('rootKeyHex')
            console.log('key:', key)
        }
        run()
    }, [wallet, refreshKey])

    useEffect(() => {
        if (!wallet) return
        const logAll = async () => {
            const { outputs, totalOutputs } = await wallet.listOutputs({
                basket: PASSPORT_BASKET,
                tags: [TAG_STATUS_ACTIVE],
                include: 'locking scripts',
                limit: 1000
            })
            console.log('WALLET active UTXOs:', totalOutputs)
            outputs.forEach(o => console.log(' ', o.outpoint, 'spendable:', o.spendable))

            const keys = await AsyncStorage.getAllKeys()
            console.log('AsyncStorage keys:', keys)

            const stored = await SecureStore.getItemAsync('draftIds')
            console.log('draftIds:', stored ? JSON.parse(stored) : [])
        }
        logAll()
    }, [walletErrors])

    if (!wallet) return null

    const handlePhotoUploaded = (ueln: string, dataUri: string) => {
        console.log('handlePhotoUploaded called:', ueln, dataUri.substring(0, 50))
        setHorseImage(prev => ({ ...prev, [ueln]: dataUri }))
    }

    const fetchActive = async () => {
        if (!wallet) return

        try {
            const { outputs: outs } = await wallet.listOutputs({
                basket: PASSPORT_BASKET,
                tags: [TAG_STATUS_ACTIVE],
                include: 'locking scripts'
            })

            console.log('active outs:', outs.length) 

            const str = (fields: number[][], i: number) => 
                Buffer.from(Uint8Array.from(fields[i] ?? [])).toString('utf-8')

            const records = outs.flatMap((o): HorsePassportRecord[] => {
                if (!o.lockingScript) return []
                const { fields } = PushDrop.decode(LockingScript.fromHex(o.lockingScript)) 

                if (fields.length < 18) return []
                if (str(fields, 0) !== '2') return []

                const status = str(fields, 1)
                if (!isPassportStatus(status)) return []

                return [{
                    version: '2',
                    status,
                    horse: {
                        id: str(fields, 2),
                        name: str(fields, 3),
                        breed: str(fields, 4),
                        birthDate: str(fields, 5),
                        sex: str(fields, 6),
                        color: str(fields, 7),
                        ownerAtRegistration: str(fields, 8),
                        location: str(fields, 9),
                        foodChainStatus: str(fields, 10) === 'true',
                        ueln: str(fields, 11),
                        chip: str(fields, 12),
                        organisation: str(fields, 13)
                    },
                    createdAt: str(fields, 14),
                    submittedAt: str(fields, 15),
                    issuedAt: str(fields, 16),
                    identityKey: str(fields, 17)
                }]
            })
            setActiveRecords(records)

            for (const r of records) {
                const id = r.horse.id
                if (!id) continue
                await AsyncStorage.setItem(`passport-active-${id}`, JSON.stringify(r))
                await SecureStore.deleteItemAsync(`passport-draft-${id}`)
            }

            const stored = await SecureStore.getItemAsync('draftIds')
            const ids: string[] = stored ? JSON.parse(stored) : []
            const activeIds = records.map(r => r.horse.id).filter(Boolean)
            await SecureStore.setItemAsync('draftIds', JSON.stringify(ids.filter(i => !activeIds.includes(i))))

        } catch (error) {
            console.error(error)
        }
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

    const listInventory = async () => {
        if (!wallet) return

        const { outputs, totalOutputs } = await wallet.listOutputs({
            basket: PASSPORT_BASKET,
            include: 'entire transactions',
            limit: 1000
        })
        console.log('PASSPORT BASKET:', totalOutputs, 'spendable:', outputs.filter(o => o.spendable).length)

        const stored = await SecureStore.getItemAsync('draftIds')
        const ids: string[] = stored ? JSON.parse(stored): []
        for (const id of ids) {
            const oldBasket = `equusv-${id}`
            const res = await wallet.listOutputs({
                basket: oldBasket,
                include: 'entire transactions',
                limit: 1000
            })
            if (res.totalOutputs > 0) {
                console.log(oldBasket, '->', res.totalOutputs, 'spendable'),
                res.outputs.filter(o => o.spendable).length
            } 
        }
    }

    const requestList = async () => {
        if (!wallet || !authFetch) return

        const stored = await SecureStore.getItemAsync('draftIds')
        const ids: string[] = stored ? JSON.parse(stored): []
        // const baskets = [PASSPORT_BASKET, ...ids.map(id => `equusv-${id}`)]
        const baskets = [PASSPORT_BASKET] 

        const payload: {basket: string; beef: number[]; outpoints: string[] }[] = []

        for (const basket of baskets) {
            const { outputs, BEEF } = await wallet.listOutputs({
                basket,
                tags: [TAG_STATUS_ACTIVE],
                include: 'entire transactions',
                limit: 1000
            })
            const spendable = outputs.filter(o => o.spendable)
            if (spendable.length === 0 || !BEEF) continue
            payload.push({ basket, beef: Array.from(BEEF), outpoints: spendable.map(o => o.outpoint)})
           
        }
        console.log('Spending baskets:', payload.length)

        const res = await authFetch.fetch(`${TOKEN_SERVER_URL}/admin/spend`, {
            method: 'POST',
            headers: { 'content-type': 'application/json'},
            body: JSON.stringify({
                baskets: payload,
                ownerIdentityKey: wallet.identityKey
            })
        })
        console.log('Spend result:', res.status, JSON.stringify(await res.json()))
    }

    const clearDevice = async () => {
        if (!wallet) return

        const stored = await SecureStore.getItemAsync('draftIds')
        const ids: string[] = stored ? JSON.parse(stored) : []
        for (const id of ids) {
            await SecureStore.deleteItemAsync(`passport-draft-${id}`)
        }
        await SecureStore.deleteItemAsync('draftIds')
        await AsyncStorage.clear()

        setSelectedRecord(null)
        setRefreshKey(prev => prev + 1)

        console.log('Device cleared')
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
 
    const fetchActivePasses = async () => {
        if (!wallet) return

        try {
            const msgBox = await createMessageBoxClient(wallet)
            const messages = await msgBox.listMessagesLite({
                messageBox: MESSAGE_BOXES.active,
                host: MESSAGEBOX_HOST
            })
            console.log('Active messages:', messages.length)
            if (messages.length === 0) return

            for (const msg of messages) {
                const body = typeof msg.body === 'string' ? JSON.parse(msg.body) : msg.body
                const { tx: txBase64, outputIndex, horseId, name} = body
                const tx = Array.from(Buffer.from(txBase64, 'base64'))

                await wallet.internalizeAction({
                    tx,
                    outputs: [{
                        outputIndex,
                        protocol: 'basket insertion',
                        insertionRemittance: {
                            basket: PASSPORT_BASKET,
                            customInstructions: JSON.stringify({ type: 'horse-passport'}),
                            tags: [tagHorse(horseId), TAG_STATUS_ACTIVE]
                        }
                    }],
                    description: `active-passport: ${name}`
                })  
                console.log('Internalized active:', horseId)

                await SecureStore.deleteItemAsync(`passport-draft-${horseId}`)
                const stored = await SecureStore.getItemAsync('draftIds')
                const ids: string[] = stored ? JSON.parse(stored): []
                await SecureStore.setItemAsync('draftIds', JSON.stringify(ids.filter(i => i !== horseId)))
            }

            await msgBox.acknowledgeMessage({
                messageIds: messages.map(m => m.messageId),
                host: MESSAGEBOX_HOST
            })
            setRefreshKey(prev => prev + 1)

        } catch (error) {
            console.error(error)
        }
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
            console.log('status:', response.status)
            
            const data = await response.json()
            console.log('data:', JSON.stringify(data))

            const { tx: txBase64, txid, outputIndex } = data
            const tx = Array.from(Buffer.from(txBase64, 'base64'))

            console.log('typeof tagHorse:', typeof tagHorse)
            console.log('basket:', PASSPORT_BASKET, 'tag:', typeof tagHorse)

            await wallet.internalizeAction({
                tx,
                outputs: [{
                    outputIndex,
                    protocol: 'basket insertion',
                    insertionRemittance: {
                        basket: PASSPORT_BASKET,
                        customInstructions: JSON.stringify({ type: 'horse-passport'}),
                        tags: [tagHorse(record.horse.id!), TAG_STATUS_PENDING]
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
                draft.revisionComment = ''
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
                console.log('Acknowledging:', messages.map(m => m.messageId))
                await msgBox.acknowledgeMessage({
                    messageIds: messages.map(m => m.messageId),
                    host: MESSAGEBOX_HOST
                })
                console.log('Acknowledged')

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

    console.log('mobile wallet identityKey:', wallet.identityKey)
    
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
                    data={listData}
                    extraData={horseImage}
                    keyExtractor={(item) => `${item.horse.id}-${item.submittedAt ?? item.createdAt}`}
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
                    horses={listData}
                    onList={() => listInventory()}
                    onRequestList={() => requestList()}
                    onClearDevice={() => clearDevice()}
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