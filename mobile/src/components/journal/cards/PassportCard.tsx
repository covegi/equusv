import { StyleSheet, View, Text, Pressable } from "react-native"
import { useState } from "react"
import type { HorsePassport } from "@/types/horse-passport"
import Ionicons from "@expo/vector-icons/Ionicons"

export default function PassportCard({ horse }: { horse: HorsePassport}) {
    const [expanded, setExpanded] = useState(false)

    return (
        <View style={styles.outerContainer}>
            <Pressable onPress={() => setExpanded(!expanded)}>
                <View style={styles.headerRow}>
                    <Text style={styles.category}>IDENTITET</Text>
                    <View style={styles.verfiedContainer}>
                        <Text style={styles.verfiedText}>Ej verifierad</Text>
                        <View style={styles.dot}/>
                        <Ionicons name="link" size={16} color="#8a7267" style={{ opacity: 0.4 }}/>
                    </View>
                </View>
                <View style={styles.secondRow}>
                    <Text style={styles.secondRowText}>Hästpass</Text>
                    </View>
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
                            <View style={[styles.foodChainBadge && horse.foodChainStatus && styles.foodChainBadgeActive]}>
                                <Text style={[styles.foodChainText, horse.foodChainStatus && styles.foodChainTextActive]}>
                                    {horse.foodChainStatus ? 'Ingår' : 'Ingår ej'}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.footerRow}>
                        <Text style={styles.verifier}>Registrerat av hästägare</Text>
                        <Text style={styles.signLink}>Skicka för verifiering</Text>
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
        width: 10,
        height: 10,
        backgroundColor: '#8a7267',
        borderRadius: 5
    },
    secondRow: {
        flexDirection: 'row'
    },
    secondRowText: {
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
    foodChainBadge: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        backgroundColor: '#F5F0EB',
    },
    foodChainText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#574238',
    },
    foodChainBadgeActive: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        backgroundColor: '#E8F5E9',
    },
    foodChainTextActive: {
        color: '#2E7D32',
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
    }
})

