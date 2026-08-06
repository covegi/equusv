import { StyleSheet, Text, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"

import { CertData } from "@/types/cert-data"

const initialsFrom = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean)
    return parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0]?.slice(0, 2).toUpperCase() ?? ''
}

export default function CertificateCard({ cert, certActive }: { cert: CertData, certActive: boolean }) {
    const isVerified = cert.verificationState === 'verified'

    return (
        <View style={styles.card}>
            { certActive && (
                <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Aktivt</Text>
                </View>
            )}
            <View style={{ alignItems: 'center' }}>
                <Ionicons name='ribbon' size={26} color={isVerified ? '#b65109' : '#574238'} />
                <Text style={[styles.title, cert.organisationName && { marginBottom: 2 }]}>{cert.certType}</Text>
                { cert.organisationName && (
                    <Text style={styles.subtitle} numberOfLines={1} adjustsFontSizeToFit>
                        {cert.organisationName}
                    </Text>
                )}
            </View>

            <View style={styles.holder}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initialsFrom(cert.holderName)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.holderLabel}>INNEHAVARE</Text>
                    <Text style={styles.holderName} numberOfLines={1} adjustsFontSizeToFit>{cert.holderName}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            { cert.role && (
                 <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Roll</Text>
                    <Text style={styles.fieldValue}>{cert.role}</Text>
                 </View>
            )}
           

            <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Certifierare</Text>
                <Text style={styles.fieldValue}>{cert.certifier}</Text>
            </View>
            <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Status</Text>
                {cert.verificationState === 'self-declared' ? (
                    <Text style={styles.fieldEmpty}>—</Text>
                 ) : cert.verificationState === 'verified' ? (
                            <View style={styles.verifiedPill}>
                                <Ionicons name="checkmark" size={12} color="#fff" />
                                <Text style={styles.verifiedPillText}>Verifierat</Text> 
                            </View>
                        ) : (
                            <Text style={styles.fieldValue}>Ej verifierat</Text>
                        )
                    }  
            </View>

            <View style={styles.divider} />

            <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Certifikat-ID</Text>
                <Text style={styles.fieldMono}>{cert.serialNumber}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderWidth: 0.5,
        borderColor: '#E8E0D8',
        borderRadius: 14,
        padding: 22,
        marginTop: 8,
        shadowColor: '#1a1a1a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    title: { 
        fontSize: 18, 
        fontWeight: '600', 
        color: '#1b1b1b', 
        marginTop: 4, 
        marginBottom: 22 
    },
    holder: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 14, 
        marginBottom: 20 
    },
    avatar: { 
        width: 54, 
        height: 54, 
        borderRadius: 27, 
        backgroundColor: '#EAE1D8', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    avatarText: { 
        fontSize: 17, 
        fontWeight: '500', 
        color: '#574238' 
    },
    holderLabel: { 
        fontSize: 10, 
        color: '#8a7267', 
        letterSpacing: 0.5 
    },
    holderName: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#1b1b1b' 
    },
    divider: { 
        height: 0.5, 
        backgroundColor: '#E8E0D8', 
        marginVertical: 14 
    },
    fieldRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 12 
    },
    fieldLabel: { 
        fontSize: 12, 
        color: '#8a7267' 
    },
    fieldValue: { 
        fontSize: 13, 
        fontWeight: '500', 
        color: '#1b1b1b' 
    },
    fieldEmpty: { 
        fontSize: 13, 
        color: '#b8ab9e' 
    },
    fieldMono: { 
        fontSize: 12, 
        color: '#574238', 
        fontFamily: 'monospace' 
    },
    verifiedPill: {
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 5,
        backgroundColor: '#b65109', 
        paddingHorizontal: 9, 
        paddingVertical: 3, 
        borderRadius: 12,
    },
    verifiedPillText: { 
        fontSize: 11, 
        color: '#fff' 
    },
    subtitle: {
        fontSize: 13,
        color: '#8a7267',
        textAlign: 'center',
        marginBottom: 22,
    },
    activeBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 12,
    },
    activeBadgeText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#1565C0',
    },
})