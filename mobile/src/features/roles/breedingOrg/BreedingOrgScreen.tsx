import { StyleSheet, View, Text, FlatList, Modal, Alert } from "react-native"
import { useState, useEffect } from 'react'
import { LookupResolver, Transaction, PushDrop, Utils } from "@bsv/sdk"
import { MessageBoxClient } from '@bsv/message-box-client'
import { useWallet } from "@/context/WalletContext"

import Header from "@/components/header/header"
import DrawerMenu from "@/components/navigation/DrawerMeny"
import BreedingOrgCard from "./BreedingOrgCard"
import HorseJournal from "@/components/journal/HorseJournal"
import { HorsePassportRecord } from "@/types/horse-passport-record"

export default function BreedingOrgScreen({ }) {
    const { wallet } = useWallet()
    const [drawerVisible, setDrawerVisible] = useState(false)
    const [pendingHorses, setPendingHorses] = useState<HorsePassportRecord[]>([])
    const [selectedRecord, setSelectedRecord] = useState<HorsePassportRecord | null>(null)

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const resolver = new LookupResolver({
                    hostOverrides: {
                        'ls_horse_passport': ['https://chooser-crimp-recast.ngrok-free.dev']
                    }
                })
                const answer = await resolver.query({
                    service: 'ls_passport',
                    query: { status: 'pending' }
                })

                if (answer.type === 'output-list') {
                    const records = answer.outputs.map(({ beef, outputIndex } ) => {
                        const tx = Transaction.fromBEEF(beef)
                        const decoded = PushDrop.decode(tx.outputs[outputIndex].lockingScript)
                        return {
                            horse: {
                                id: Utils.toUTF8(decoded.fields[2]),
                                name: Utils.toUTF8(decoded.fields[3]),
                                breed: Utils.toUTF8(decoded.fields[4]),
                                birthDate: Utils.toUTF8(decoded.fields[5]),
                                sex: Utils.toUTF8(decoded.fields[6]),
                                color: Utils.toUTF8(decoded.fields[7]),
                                ownerAtRegistration: Utils.toUTF8(decoded.fields[8]),
                                location: Utils.toUTF8(decoded.fields[9]),
                                foodChainStatus: Utils.toUTF8(decoded.fields[10]) === 'true',
                                ueln: Utils.toUTF8(decoded.fields[11]),
                                chip: Utils.toUTF8(decoded.fields[12]),
                            },
                            status: Utils.toUTF8(decoded.fields[1]),
                            createdAt: Utils.toUTF8(decoded.fields[14]),
                            submittedAt: Utils.toUTF8(decoded.fields[15]),
                            ownerIdentityKey: decoded.lockingPublicKey.toString(),
                            } as HorsePassportRecord
                            
                    })
                    
                    setPendingHorses(records.sort((a, b) =>
                        (a.submittedAt ?? '').localeCompare(b.submittedAt ?? '')
                    ))
                }
            } catch (error) {
                console.error('Lookup failed', error)
            }
        } 
        fetchPending()
    }, [])

    const handleRevision = (record: HorsePassportRecord, comment: string) => {
        Alert.alert(
            'Skicka revision',
            `Vill du skicka tillbaka ansök för ${record.horse.name?.trim() ?? 'denna häst'}?`,
            [
                    { text: 'Avbryt', style: 'cancel'},
                    { text: 'Skicka', style: 'default', onPress: () => sendRevision(record, comment) }
            ]
        )
    }

    const sendRevision = async (record: HorsePassportRecord, comment: string) => {
        if (!wallet || !record.ownerIdentityKey) return

        try {
            const msgBox = new MessageBoxClient({
                walletClient: wallet,
                host: 'https://messagebox.babbage.systems',
            })
            await msgBox.init()

            await msgBox.sendMessage({
                recipient: record.ownerIdentityKey,
                messageBox: 'equusv_passport_revisions',
                body: {
                    type: 'revision',
                    horseId: record.horse.id,
                    comment,
                    record: {...record, status: 'revision'}
                },
            })
            console.log('Revision sent to:', record.ownerIdentityKey)
            setSelectedRecord(null)
        } catch (error) {
            console.error('Failed to send revision:', error)
        }
    }

    const onPress = () => {}

    let content

    if (pendingHorses.length === 0) {
        content = (
            <View style={styles.centerContainer}>
                <Text style={styles.iconText}>Inga inkomna ärenden</Text>
            </View>
            )
        } else {
            content = (
                <FlatList
                    data={pendingHorses}
                    keyExtractor={(item) => item.horse.id ?? ''}
                    renderItem={({ item }) => {
                        const h = item.horse
                        if (!h.id || !h.name || !h.breed || !h.sex || !h.birthDate) return null

                        return (
                            <BreedingOrgCard
                                name={h.name}
                                category='IDENTITET'
                                taskLabel='Passansökan'
                                breed={h.breed}
                                sex={h.sex}
                                birthDate={h.birthDate}
                                statusText='Väntar på granskning'
                                onPress={() => setSelectedRecord(item)}
                            />
                        )
                    }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: 20, paddingBottom: 50, paddingHorizontal: 25 }}
                />
            )
        }

    return (
        <>
            <View style={styles.outerContainer}>
                <Header onMenuPress={() => setDrawerVisible(true)} />
                {content}
            </View>
            <DrawerMenu 
                visible={drawerVisible}
                onClose={() => setDrawerVisible(false)}
            />
            <Modal visible={!!selectedRecord} animationType="slide" presentationStyle="pageSheet">
                <HorseJournal 
                    record={selectedRecord}
                    onClose={() => setSelectedRecord(null)}
                    onApprove={(record) => { console.log('Approve:', record.horse.id) }}
                    onRevision={sendRevision}
                />
            </Modal>
        </>
        
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
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconText: {
        fontFamily: 'Inter_300Light',
        fontSize: 16,
        color: '#8a7267'
    },
})