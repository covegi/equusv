    import { StyleSheet, View, Text, FlatList, Modal, Alert } from "react-native"
    import { useState, useEffect, useMemo } from 'react'
    import { LookupResolver, Transaction, PushDrop, Utils, AuthFetch, Hash } from "@bsv/sdk"
    import { createMessageBoxClient, MESSAGE_BOXES, MESSAGEBOX_HOST } from "@/utils/messageBox"
    import { useWallet } from "@/context/WalletContext"

    import Header from "@/components/header/header"
    import DrawerMenu from "@/components/navigation/DrawerMeny"
    import BreedingOrgCard from "./BreedingOrgCard"
    import HorseJournal from "@/components/journal/HorseJournal"
    import { HorsePassportRecord, isPassportStatus, ApprovalPayload } from "@/types/horse-passport-record"

    const TOKEN_SERVER_URL = process.env.EXPO_PUBLIC_TOKEN_SERVER_URL

    const serializeFields = (fields: number[][]): number[] => {
        const out: number[] = []
        for (const field of fields) {
            const len = field.length
            out.push((len >>> 24) & 0xff, (len >>> 16) & 0xff, (len >>> 8) & 0xff, len & 0xff)
            out.push(...field)
        }
        return out
    }

    const buildPassportFields = (record: HorsePassportRecord): number[][] => {
        const horse = record.horse

        const fields = [
            record.version,
            record.status,
            horse.id,
            horse.name,
            horse.breed,
            horse.birthDate,
            horse.sex,
            horse.color,
            horse.ownerAtRegistration,
            horse.location,
            (horse.foodChainStatus ?? false).toString(),
            horse.ueln,
            horse.chip,
            horse.organisation,
            record.createdAt,
            record.submittedAt,
            record.issuedAt,
            record.identityKey
        ].map(field => Utils.toArray(field ?? '', 'utf8'))

        if (fields.length !== 18) {
            throw new Error(`Expected 18 fields, got ${fields.length}`)
        }
        return fields
    }

    export default function BreedingOrgScreen({ }) {
        const { wallet } = useWallet()
        const [drawerVisible, setDrawerVisible] = useState(false)
        const [pendingHorses, setPendingHorses] = useState<HorsePassportRecord[]>([])
        const [selectedRecord, setSelectedRecord] = useState<HorsePassportRecord | null>(null)

        const authFetch = useMemo(() =>
            wallet ? new AuthFetch(wallet) : null
        , [wallet])

        useEffect(() => {
            const fetchPending = async () => {
                try {
                    const resolver = new LookupResolver({
                        hostOverrides: {
                            'ls_passport': ['https://chooser-crimp-recast.ngrok-free.dev']
                        }
                    })
                    const answer = await resolver.query({
                        service: 'ls_passport',
                        query: { status: 'pending' }
                    })

                    if (answer.type === 'output-list') {
                        const records = answer.outputs.flatMap(({ beef, outputIndex }): HorsePassportRecord[] => {
                            const tx = Transaction.fromBEEF(beef)
                            const decoded = PushDrop.decode(tx.outputs[outputIndex].lockingScript)

                            if (decoded.fields.length < 18) return []
                            const version = Utils.toUTF8(decoded.fields[0])
                            if (version !== '2') return []

                            const status = Utils.toUTF8(decoded.fields[1])
                            if (!isPassportStatus(status)) return []

                            return [{
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
                                    organisation: Utils.toUTF8(decoded.fields[13]),
                                },
                                version: version,
                                status: status,
                                createdAt: Utils.toUTF8(decoded.fields[14]),
                                submittedAt: Utils.toUTF8(decoded.fields[15]),
                                issuedAt: Utils.toUTF8(decoded.fields[16]),
                                identityKey: Utils.toUTF8(decoded.fields[17])
                                }]
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
            if (!wallet || !record.identityKey) return

            try {
                const msgBox = await createMessageBoxClient(wallet)

                await msgBox.sendMessage({
                    recipient: record.identityKey,
                    messageBox: MESSAGE_BOXES.revisions,
                    body: {
                        type: 'revision',
                        tokenType: 'passport',
                        horseId: record.horse.id,
                        comment,
                        record: {...record, status: 'revision'}
                    },
                },
                MESSAGEBOX_HOST
            )
            
                console.log('Revision sent to:', record.identityKey)
                setSelectedRecord(null)
                console.log('Filtering out horse:', record.horse.id)
                setPendingHorses(prev => {
                    console.log('Before filter:', prev.length)
                    const filtered = prev.filter(h => h.horse.id !== record.horse.id)
                    console.log('After filter:', filtered.length)
                    return filtered
                })
            } catch (error) {
                console.error('Failed to send revision:', error)
            }
        }

        const handleApprove = async (record: HorsePassportRecord) => {
            if (!authFetch) return
            if (!record.identityKey) return

            const approved: HorsePassportRecord = {
                ...record,
                status: 'active',
                issuedAt: new Date().toISOString()
            }

            const fields = buildPassportFields(approved)
            const serialized = serializeFields(fields)
            const hashBytes = Hash.sha256(serialized)
            const hash = Utils.toHex(hashBytes)

            const { signature } = await wallet!.createSignature({
                hashToDirectlySign: hashBytes,
                protocolID: [2, 'equusv identity passport'],
                keyID: approved.horse.id!,
                counterparty: 'anyone'
            })

            const signatureHex = Utils.toHex(signature)

            const publicKey = await wallet!.getPublicKey({ identityKey: true })

            try {
                const response = await authFetch?.fetch(`${TOKEN_SERVER_URL}/identity/passport/approve`, {
                    method: 'POST',
                    headers: { 'content-type': 'application / json' },
                    body: JSON.stringify({
                        signature: {
                            record: approved,
                            hash,
                            signature: signatureHex,
                            certifierIdentityKey: publicKey
                        }
                    })
                })
                if (!response.ok) {
                    const text = await response.text()
                    throw new Error(`Approve failed: ${response.status} ${text}`)
                }
                setSelectedRecord(null)
                setPendingHorses(prev => prev.filter(h => h.horse.id !== record.horse.id))
            } catch (error) {
                console.error(error)
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
                        onApprove={handleApprove}
                        onRevision={handleRevision}
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