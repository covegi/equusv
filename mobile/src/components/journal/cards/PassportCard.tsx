import { StyleSheet, View, Text, Pressable, TextInput } from "react-native"
import { useState } from "react"
import type { HorsePassport } from "@/types/horse-passport"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useRole } from "@/context/RoleContext"

export default function PassportCard({ horse, status='draft', onEdit, onDelete, onSend, onRevision, onApprove }: { horse: Partial<HorsePassport>, status?: string, onEdit?: () => void, onDelete?: () => void, onSend?: () => void, onRevision?: (comment: string) => void, onApprove?: () => void }) {
    const [expanded, setExpanded] = useState(false)
    const { activeRole } = useRole()
    const [showRevisionInput, setShowRevisionInput] = useState(false)
    const [revisionComment, setRevisionComment] = useState('')

    const statusColors: Record<string, { bg: string, text: string, label: string, dot: string, verifiedText: string, checkmark: boolean }> = {
        draft:    { bg: '#F5F0EB', text: '#8a7267', label: 'Utkast',   dot: '#c6c6c7', verifiedText: 'Ej verifierat', checkmark: false },
        pending:  { bg: '#FFF3E0', text: '#B65109', label: 'Skickat',  dot: '#d4a843', verifiedText: 'Väntar på verifiering', checkmark: false },
        revision: { bg: '#FCEAEA', text: '#A13232', label: 'Revision', dot: '#A13232', verifiedText: 'Återsänd', checkmark: false },
        active:   { bg: '#E3F2FD', text: '#1565C0', label: 'Aktivt',   dot: '#b65109', verifiedText: 'Verifierat', checkmark: true },
        inactive: { bg: '#F5F0EB', text: '#8a7267', label: 'Inaktivt',  dot: '#8a7267', verifiedText: 'Inaktivt', checkmark: false },
    }

    const current = statusColors[status] ?? statusColors.draft

    const showInfo = () => {
        console.log('Showing info modal')
    }

    return (
        <View style={styles.outerContainer}>
            <Pressable onPress={() => setExpanded(!expanded)}>
                <View style={styles.headerRow}>
                    <Text style={styles.category}>IDENTITET</Text>
                    <View style={styles.verfiedContainer}>
                        <Text style={styles.verfiedText}>{current.verifiedText}</Text>
                        {current.checkmark 
                            ? <Ionicons name="checkmark-circle" size={14} color={current.dot} />
                            : <View style={[styles.dot, { backgroundColor: current.dot }]} />
                        }
                    </View>
                </View>
                <View style={styles.titleRow}>
                        <View style={styles.titleInfo}>
                            <Text style={styles.titleText}>Hästpass</Text>
                            <Pressable onPress={showInfo} hitSlop={10}>
                                <Ionicons name='information-circle-outline' size={18} color='#8a7267' style={{ marginTop: 4 }}/>
                            </Pressable>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: current.bg }]}>
                            <Text style={[styles.statusText, { color: current.text }]} >
                                {current.label}
                            </Text>
                        </View>
                </View>
                {status === 'revision' ?
                <View style={styles.revisionBanner}>
                      <Text style={styles.revisionText}>Avelsorganisation har skickat tillbaka ansökan. Vänligen kontrollera och komplettera uppgifterna.</Text>  
                </View> 
                : ''
                }
            </Pressable>

            {expanded && (
                <>
                    <View style={styles.divider} />
                    <View style={styles.dataRow}>
                        <View style={styles.dataColumn}>
                            <Text style={styles.label}>Namn</Text>
                            <Text style={styles.value}>{horse.name}</Text>
                        </View>
                        <View style={styles.dataColumn}>
                            <Text style={styles.label}>UELN</Text>
                            <Text style={styles.value}>{horse.ueln}</Text>
                        </View>
                    </View>
                    <View style={styles.dataRow}>
                        <View style={styles.dataColumn}>
                            <Text style={styles.label}>Ras</Text>
                            <Text style={styles.value}>{horse.breed}</Text>
                        </View>
                        <View style={styles.dataColumn}>
                            <Text style={styles.label}>Kön</Text>
                            <Text style={styles.value}>{horse.sex}</Text>
                        </View>
                    </View>
                    <View style={styles.dataRow}>
                        <View style={styles.dataColumn}>
                            <Text style={styles.label}>Födelsedatum</Text>
                            <Text style={styles.value}>{horse.birthDate}</Text>
                        </View>
                        <View style={styles.dataColumn}>
                            <Text style={styles.label}>Färg</Text>
                            <Text style={styles.value}>{horse.color}</Text>
                        </View>
                    </View>
                    <View style={styles.dataRow}>
                        <View style={styles.dataColumn}>
                            <Text style={styles.label}>Chipnr</Text>
                            <Text style={styles.value}>{horse.chip}</Text>
                        </View>
                        <View style={styles.dataColumn}>
                            <Text style={styles.label}>Plats</Text>
                            <Text style={styles.value}>{horse.location}</Text>
                        </View>
                    </View>
                    <View style={[styles.dataRow, { alignItems: 'center' }]}>
                        <View style={styles.dataColumn}>
                            <Text style={styles.label}>Livsmedelskedjan</Text>
                        </View>
                        <View style={styles.dataColumn}>
                            <View style={[styles.foodChainBadge, horse.foodChainStatus ? styles.foodChainActive : styles.foodChainInactive]}>
                                <Text style={horse.foodChainStatus ? styles.foodChainTextActive: styles.foodChainTextInactive}>
                                    {horse.foodChainStatus ? 'Ingår' : 'Ingår ej'}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    {status === 'pending' && activeRole === 'breedingOrg' && showRevisionInput ? (
                        <>
                            <Text style={styles.commentLabel}>Kommentar till hästägare</Text>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Beskriv vad som behövs kompletteras (valfritt)"
                                placeholderTextColor="#8a7267"
                                value={revisionComment}
                                onChangeText={setRevisionComment}
                                multiline
                            />
                            <View style={[styles.draftBtns, { justifyContent: 'flex-end', marginTop: 10 }]}>
                                <Pressable onPress={() => { setShowRevisionInput(false); setRevisionComment('')}} hitSlop={10}>
                                    <Text style={[styles.signLink, { color: '#8a7267' }]}>Avbryt</Text>
                                </Pressable> 
                                <Pressable onPress={() => onRevision?.(revisionComment)} hitSlop={10}>
                                    <Text style={[styles.signLink, { color: '#93000a' }]}>Skicka revision</Text>
                                </Pressable>
                            </View>
                        </>
                    ):  (
                        <View style={styles.footerRow}>
                            <Text style={styles.verifier}>Skapat av hästägare</Text>
                        
                            {status === 'draft' && activeRole === 'owner' && (
                                <View style={styles.draftBtns}>
                                    <Pressable
                                        onPress={() => onDelete?.()}
                                        hitSlop={10}
                                    >
                                        <Text style={[styles.signLink, { color: '#93000a' }]}>Radera</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => onEdit?.()}
                                        hitSlop={10}
                                    >
                                        <Text style={[styles.signLink, { color: '#8a7267'}]}>Redigera</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => onSend?.()}
                                        hitSlop={10}
                                    >
                                        <Text style={[styles.signLink, { color: '#1b1b1b'}]}>Skicka</Text>
                                    </Pressable>
                                 </View>
                            )}

                            {status === 'pending' && activeRole === 'owner' && (
                                <Text style={[styles.signLink, { color: '#93000a' }]}>Återkalla</Text>
                            )}
                            
                            {status === 'pending' && activeRole === 'breedingOrg' && (
                                <View style={styles.draftBtns}>
                                    <Pressable onPress={() => setShowRevisionInput(true)} hitSlop={10}>
                                        <Text style={[styles.signLink, { color: '#93000a' }]}>Revision</Text>
                                    </Pressable>
                                    <Pressable onPress={onApprove} hitSlop={10}>
                                        <Text style={[styles.signLink, { color: '#1b1b1b' }]}>Godkänn</Text>
                                    </Pressable>
                                </View>
                            )}

                            {status === 'revision' && activeRole === 'owner' && (
                                <View style={styles.draftBtns}>
                                    <Text style={[styles.signLink, { color: '#8a7267'}]}>Redigera</Text>
                                    <Text style={[styles.signLink, { color: '#1b1b1b'}]}>Skicka igen</Text>
                                </View>
                            )}
                        </View>
                    )}
                </>
                )} 
                </View>
            )
        }

const styles = StyleSheet.create({
    outerContainer: {
        backgroundColor: '#fff',
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    category: {
        fontWeight: 600,
        color: '#B65109',
        letterSpacing: 1
    },
    verfiedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    verfiedText: {
        color: '#8a7267',
        fontSize: 12
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    revisionBanner: {
        backgroundColor: '#FCEAEA',
        borderWidth: 1,
        borderColor: '#e8b4b4',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        marginBottom: 12
    },
    revisionText: {
        fontSize: 11,
        color: '#A13232',
        lineHeight: 16,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4
    },
    titleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    statusBadge: {
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    titleText: {
        fontSize: 18,
        fontWeight: 600,
        color: '#1b1b1b',
        marginTop: 4
    },
    divider: {
        height: 1,
        backgroundColor: '#E8E0D8',
        marginVertical: 12
    },
    dataRow: {
        flexDirection: 'row',
        marginBottom: 14
    },
    dataColumn: {
        flex: 1
    },
    label: {
        fontSize: 12,
        color: '#8a7267',
    },
    value: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1b1b1b',
        marginTop: 2,
    },
    verifier: {
        color: '#8a7267',
        fontSize: 12
    },
    foodChainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 14
    },
    foodChainText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#574238',
    },
    foodChainTextActive: {
        color: '#2E7D32',
    },
    foodChainBadge: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    foodChainActive: {
        backgroundColor: '#E8F5E9',
    },
    foodChainInactive: {
        backgroundColor: '#F5F0EB',
    },
    foodChainTextInactive: {
        color: '#8a7267',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    signLink: {
        fontSize: 12,
        color: '#1b1b1b',
        fontWeight: '500',
    },
    draftBtns: {
        flexDirection: 'row',
        gap: 12,
    },
    commentLabel: {
        fontSize: 11,
        color: '#8a7267',
        marginBottom: 6
    },
    commentInput: {
        backgroundColor: '#F5F0EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        color: '#1b1b1b',
        minHeight: 50,
        textAlignVertical: 'top',
    },

})

