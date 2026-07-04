import { StyleSheet, View, Text, Pressable } from "react-native"
import { useState } from "react"
import type { HorsePassport } from "@/types/horse-passport"
import Ionicons from "@expo/vector-icons/Ionicons"
import PassportModal from "@/components/modal/PassportModal"

export default function PassportCard({ horse, status='draft', onEdit, onDelete, onSend }: { horse: Partial<HorsePassport>, status?: string, onEdit: () => void, onDelete: () => void, onSend: () => void }) {
    const [expanded, setExpanded] = useState(false)

    const statusColors: Record<string, { bg: string, text: string, label: string, dot: string, verifiedText: string, checkmark: boolean }> = {
        draft:    { bg: '#F5F0EB', text: '#8a7267', label: 'Utkast',   dot: '#c6c6c7', verifiedText: 'Ej verifierat',          checkmark: false },
        pending:  { bg: '#FFF3E0', text: '#B65109', label: 'Skickat',  dot: '#d4a843', verifiedText: 'Väntar på verifiering',  checkmark: false },
        revision: { bg: '#FCEAEA', text: '#A13232', label: 'Revision', dot: '#A13232', verifiedText: 'Återsänd',               checkmark: false },
        approved: { bg: '#E8F5E9', text: '#2E7D32', label: 'Godkänt',  dot: '#2E7D32', verifiedText: 'Godkänt',                checkmark: false },
        active:   { bg: '#E3F2FD', text: '#1565C0', label: 'Aktivt',   dot: '#b65109', verifiedText: 'Verifierat',             checkmark: true },
    }

    const current = statusColors[status] ?? statusColors.draft

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
                        <Text style={styles.titleText}>Hästpass</Text>
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
                    <View style={styles.footerRow}>
                        <Text style={styles.verifier}>Skapat av hästägare</Text>
                        {status === 'draft' && (
                            <View style={styles.draftBtns}>
                                <Pressable
                                    onPress={() => onDelete()}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Text style={[styles.signLink, { color: '#93000a' }]}>Radera</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => onEdit()}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Text style={[styles.signLink, { color: '#8a7267'}]}>Redigera</Text>
                                </Pressable>
                                <Pressable onPress={() => onSend()}>
                                    <Text style={[styles.signLink, { color: '#1b1b1b'}]}>Skicka</Text>
                                </Pressable>
                            </View>

                        )}
                        {status === 'pending' && (
                            <Text style={[styles.signLink, { color: '#93000a' }]}>Återkalla</Text>
                        )}
                        {status === 'revision' && (
                            <View style={styles.draftBtns}>
                                <Text style={[styles.signLink, { color: '#8a7267'}]}>Redigera</Text>
                                <Text style={[styles.signLink, { color: '#1b1b1b'}]}>Skicka igen</Text>
                            </View>
                        )}
                    </View>
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
    }

})

