    import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
    import { useState, useEffect, useMemo } from 'react'
    import { useWallet } from '@/context/WalletContext'
    import * as SecureStore from 'expo-secure-store'
    import { AuthFetch, PushDrop, LockingScript } from '@bsv/sdk'
    import { useRouter } from 'expo-router'

    import PassportCard from '@/components/passport/PassportCard'
    import { HorsePassportDraft } from '@/types/horse-passport-draft'
    import { usePassportModal } from '@/context/PassportModalContext'
    import PassportModal from '@/components/modal/PassportModal'
    import { HorsePassport } from '@/types/horse-passport'
    import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

    const TOKEN_SERVER_URL = process.env.EXPO_PUBLIC_TOKEN_SERVER_URL

    export default function PassportScreen() {
        const [drafts, setDrafts] = useState<HorsePassportDraft[]>([])
        const [refresh, setRefresh] = useState(0)
        const [editingDraft, setEditingDraft] = useState<HorsePassportDraft | null>(null)
        const { visible, setVisible } = usePassportModal()
        const [activePassports, setActivePassports] = useState<HorsePassport[]>([])
        const { wallet } = useWallet()
        const router = useRouter()

        const authFetch = useMemo(() => {
            if (!wallet) return null
            return new AuthFetch(wallet)
        }, [wallet])

        useEffect(() => {
            const fetchDrafts = async () => {
                try {
                    const storedUelns = await SecureStore.getItemAsync('horseUelns')
                    console.log('storedUelns:', storedUelns)
                    const uelns: string[] = storedUelns ? JSON.parse(storedUelns) : []
                    console.log('uelns:', uelns)
                    
                    const fetchedDrafts = await Promise.all(
                    uelns.map(async (ueln) => {
                        const stored = await SecureStore.getItemAsync(`passport-draft-${ueln}`)
                        console.log(`passport-draft-${ueln}:`, stored)
                        return stored ? JSON.parse(stored) as HorsePassportDraft : null
                        })
                    )
                    console.log('validDrafts:', fetchedDrafts)
                    const validDrafts = fetchedDrafts.filter(draft => draft !== null) as HorsePassportDraft[]
                    setDrafts(validDrafts)
                } catch (error) {
                    console.error(error)
                }
            }

            const fetchActivePassport = async () => {
                try {
                    if (!wallet) throw new Error('No wallet loaded')
                    
                    const storedUelns = await SecureStore.getItemAsync('horseUelns')
                    const uelns: string[] = storedUelns ? JSON.parse(storedUelns): []

                    const outputResults = await Promise.all(
                        uelns.map(async (ueln) => {
                            return await wallet.listOutputs({
                                basket: `equusv-${ueln}`,
                                include: 'locking scripts'
                            })
                        })
                    )

                    let activePassports: HorsePassport[] = []

                    for (const result of outputResults) {
                        if (result.outputs.length > 0) {
                            if (result.outputs[0].lockingScript) {
                                const script = LockingScript.fromHex(result.outputs[0].lockingScript)
                                const { fields } = PushDrop.decode(script)
                                
                                const horse: HorsePassport = {
                                    version: Buffer.from(fields[0]).toString('utf-8'),
                                    name: Buffer.from(fields[1]).toString('utf-8'),
                                    breed: Buffer.from(fields[2]).toString('utf-8'),
                                    birthDate: Buffer.from(fields[3]).toString('utf-8'),
                                    sex: Buffer.from(fields[4]).toString('utf-8'),
                                    color: Buffer.from(fields[5]).toString('utf-8'),
                                    ueln: Buffer.from(fields[6]).toString('utf-8'),
                                    chip: Buffer.from(fields[7]).toString('utf-8'),
                                    ownerAtRegistration: Buffer.from(fields[8]).toString('utf-8'),
                                    location: Buffer.from(fields[9]).toString('utf-8'),
                                    organisation: Buffer.from(fields[10]).toString('utf-8'),
                                    issuedDate: Buffer.from(fields[11]).toString('utf-8'),
                                    foodChainStatus: Buffer.from(fields[12]).toString('utf-8') === 'true'
                                }
                                activePassports.push(horse)
                            }   
                        }
                    }
                    console.log(activePassports)
                    setActivePassports(activePassports)
                    
                } catch (error) {}
            }
            fetchDrafts()
            fetchActivePassport()
        }, [refresh])

        const handleOnDelete = async (ueln: string) => {
            try {
                if (!authFetch) throw new Error('No AuthFetch instance detected')
                const response = await authFetch.fetch(`${TOKEN_SERVER_URL}/draft`, {
                    method: 'DELETE',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        tokenType: 'identity/passport',
                        identityKey: wallet!.identityKey,
                        ueln
                    })
                })
                await SecureStore.deleteItemAsync(`passport-draft-${ueln}`)  
                setRefresh(n => n + 1)
                return response.status
                
            } catch (error) {
                console.error('Not able to delete draft from server')
            }
        }

        const handleOnCertify = async (ueln: string) => {
            if (!wallet) throw new Error('No wallet loaded')

            console.log('Skickar certifieringsansökan för:', ueln)

            try {
                const draftInSecureStore = await SecureStore.getItemAsync(`passport-draft-${ueln}`)
                if (!draftInSecureStore) throw new Error('No draft in SecureStore')

                const updatedDraft: HorsePassportDraft = {...JSON.parse(draftInSecureStore), status: 'pending'}
                await SecureStore.setItemAsync(`passport-draft-${ueln}`, JSON.stringify(updatedDraft))
        
                setRefresh(n => n + 1)
            } catch (error) {
                console.error('Error updating status:', error)
            }
        }

        const handleOnRevoke = async (ueln: string) => {
        try {
                const storedDraft = await SecureStore.getItemAsync(`passport-draft-${ueln}`)
                const draft = storedDraft ? JSON.parse(storedDraft) : ''

                const updatedDraft = {...draft, status: 'draft'}
                await SecureStore.setItemAsync(`passport-draft-${ueln}`, JSON.stringify(updatedDraft))
                setRefresh(n => n + 1)
            
            } catch (error) {
                console.error(error)
            }
        }

        const handleOnEdit = (ueln: string) => {
            const draft = drafts.find(d => d.horse.ueln === ueln)
            setEditingDraft(draft ?? null)
            setVisible(true)
        }

        const handleOnBroadcast = async (ueln: string) => {
            try {
                if (!wallet) throw new Error('No wallet loaded')
                if (!authFetch) throw new Error('No authFetch instantiated')

                const horse = drafts.find(d => d.horse.ueln === ueln)?.horse
                if (!horse) throw new Error('No draft found')
                
                const identityKey = wallet.identityKey

                const response = await authFetch.fetch(`${TOKEN_SERVER_URL}/identity/passport/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ horse, identityKey })
                })

                if (!response.ok) throw new Error('Failed to create token')
                const { tx: txBase64, txid, outputIndex } = await response.json()
                const tx = Array.from(Buffer.from(txBase64, 'base64'))

                console.log('InternalizeAction started...')

                await wallet.internalizeAction({
                    tx,
                    outputs: [{
                        outputIndex: outputIndex,
                        protocol: 'basket insertion',
                        insertionRemittance: {
                            basket: `equusv-${ueln}`,
                            customInstructions: JSON.stringify({ type: 'horse-passport' }),
                            tags: ['passport']
                        }
                    }],
                    description: 'Internalize horse passport'
                })

                setActivePassports(prev => prev.some(p => p.ueln === ueln) ? prev : [...prev, horse])

                console.log('InternalizeAction completed')

                await SecureStore.deleteItemAsync(`passport-draft-${ueln}`)
                setRefresh(n => n + 1)
                
                await authFetch.fetch(`${TOKEN_SERVER_URL}/draft`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        identityKey,
                        ueln,
                        tokenType: 'identity/passport'
                    })
                }) 

            } catch (error) {
                console.error(error)
            }
        }

        return (
            <View style={styles.container}>
                {visible &&  <PassportModal
                    horse={editingDraft?.horse}
                    visible={visible}
                    onSaved={() => setRefresh(n => n + 1)}
                    onClose={() => setVisible(false)}
                />}
               
                <FlatList
                    data={drafts.concat(activePassports.map(horse => ({ horse, status: 'active', createdAt: ''})))}
                    keyExtractor={(item) => item.horse.ueln}
                    renderItem={({ item }) => (
                        <PassportCard
                            horse={item.horse}
                            status={item.status}
                            onDelete={() => handleOnDelete(item.horse.ueln)}
                            onCertify={() => handleOnCertify(item.horse.ueln)}
                            onRevoke={() => handleOnRevoke(item.horse.ueln)}
                            onEdit={() => handleOnEdit(item.horse.ueln)}
                            onBroadcast={() => handleOnBroadcast(item.horse.ueln)}
                        />
                    )}
                />
                <TouchableOpacity onPress={() => router.replace('/horses')} style={styles.footer}>
                    <FontAwesome6 name='horse' size={18} color='#f7f2f2' />
                    <Text style={styles.footerText}>Mina hästar</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#1a1a1a',
            paddingHorizontal: 10
        },
        footer: {
            height: 70,
            width: '100%',
            alignItems: 'center',
            gap: 6
        },
        footerText: {
            fontFamily: 'Inter_300Light',
            fontSize: 10,
            color: '#f7f2f2',
            
        }
        
    })