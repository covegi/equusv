import { StyleSheet, View, Text, Pressable, Dimensions } from "react-native"
import { useEffect, useState } from "react"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated'
import { DisplayableIdentity, IdentityClient, Utils } from "@bsv/sdk"
import Svg, { Path, Circle } from 'react-native-svg'
import { scheduleOnRN } from 'react-native-worklets'
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRole } from "@/context/RoleContext"
import type { RoleId } from "@/constants/certificates"
import Ionicons from "@expo/vector-icons/Ionicons"
import { CertData } from "@/types/cert-data"
import CertificateCard from "@/features/identity/CertificateCard"
import type { HorsePassportRecord } from "@/types/horse-passport-record"
import { useWallet } from "@/context/WalletContext"
import { discoverIdentity } from "@/utils/discoverIdentity"

const SCREEN_WIDTH = Dimensions.get('window').width
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75
const CLOSE_THRESHOLD = DRAWER_WIDTH * 0.3
const SCREEN_HEIGHT = Dimensions.get('window').height
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.4
const SHEET_CLOSE_THRESHOLD = SHEET_HEIGHT * 0.3
const CERT_SHEET_HEIGHT = SCREEN_HEIGHT * 0.88
const CERT_SHEET_CLOSE_THRESHOLD = CERT_SHEET_HEIGHT * 0.3

const CERTS: Record<'owner' | 'breedingOrg', CertData> = {
    owner: {
        certType: 'Hästägarcertifikat',
        holderName: 'Peter de Michiel',
        certifier: 'Självdeklarerat',
        verificationState: 'self-declared',
        serialNumber: '12345',
    },
    breedingOrg: {
        certType: 'Avelsorganisationscertifikat',
        holderName: 'Peter de Michiel',
        organisationName: 'Svenska fullblodsavelsföreningen',
        role: 'Admin',
        certifier: 'Jordbruksverket',
        verificationState: 'unverified',
        serialNumber: '12345',
    },
}

export default function DrawerMenu({ visible, onClose, horses = [], onList, onRequestList, onClearDevice }: { visible: boolean, onClose: () => void, horses?: HorsePassportRecord[], onList?: () => void, onRequestList?: () => void, onClearDevice?: () => void }) {
    const { activeRole, setActiveRole, availableRoles } = useRole()
    const insets = useSafeAreaInsets()
    const { wallet } = useWallet()
    const translateX = useSharedValue(-DRAWER_WIDTH)
    const translateY = useSharedValue(SHEET_HEIGHT)
    const [menuOpen, setMenuOpen] = useState(false)
    const [selectedCert, setSelectedCert] = useState<('owner' | 'breedingOrg' | null)>(null)
    const [certListOpen, setCertListOpen] = useState(false)
    const certTranslateY = useSharedValue(CERT_SHEET_HEIGHT)
    const [certActive, setCertActive] = useState(false)
    const [identities, setIdentities] = useState<DisplayableIdentity[]>([])
    const [certs, setCerts] = useState<any[]>([])

    useEffect(() => {
        if (!wallet) return
        const run = async () => {
            const { publicKey } = await wallet.getPublicKey({ identityKey: true })
            const discovered = await discoverIdentity(publicKey)
            setCerts(discovered)
            console.log('discovered:', JSON.stringify(discovered))
        }
        run()
    }, [wallet])

    const certRows = certs.map(cert => {
        const type = Utils.toUTF8(Utils.toArray(cert.type, 'base64'))
        const roleId: RoleId = type.includes('breeding') ? 'breedingOrg' : 'owner'
        return {
            roleId,
            role: roleId === 'owner' ? 'Hästägare' : 'AvelsOrganisation',
            serialNumber: cert.serialNumber,
            decryptedFields: cert.decryptedFields
        }
    })

    useEffect(() => {
        translateX.value = withTiming(visible ? 0 : -DRAWER_WIDTH, { duration: 250 })
    }, [visible])

    useEffect(() => {
        translateY.value = withTiming(certListOpen ? 0 : SHEET_HEIGHT, { duration: 250, easing: Easing.out(Easing.cubic) })
    }, [certListOpen])

    useEffect(() => {
        certTranslateY.value = withTiming(selectedCert ? 0 : CERT_SHEET_HEIGHT, {
            duration: 250,
            easing: Easing.out(Easing.cubic)
        })
    }, [selectedCert])

    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((e) => {
            if (e.translationX < 0) {
                translateX.value = e.translationX
            }
        })
        .onEnd((e) => {
            if (e.absoluteY < -CLOSE_THRESHOLD) {
                translateX.value = withTiming(-DRAWER_WIDTH, { duration: 200 })
            } else {
                translateX.value = withTiming(0, { duration: 200 })
            }
        })

    const certListPanGesture = Gesture.Pan()
        .onUpdate((e) => {
            if (e.translationY > 0) {
                translateY.value = e.translationY
            }
        })
        .onEnd((e) => {
            if (e.translationY > SHEET_CLOSE_THRESHOLD) {
                translateY.value = withTiming(SHEET_HEIGHT, { duration: 200, easing: Easing.out(Easing.cubic) })
            } else {
                translateY.value = withTiming(0, { duration: 200 })
            }
        })

    const certSheetPanGesture = Gesture.Pan()
        .onUpdate((e) => {
            if (e.translationY > 0) certTranslateY.value = e.translationY
        })
        .onEnd((e) => {
            if (e.translationY > CERT_SHEET_CLOSE_THRESHOLD) {
                certTranslateY.value = withTiming(CERT_SHEET_HEIGHT, { 
                    duration: 200,
                    easing: Easing.out(Easing.cubic)    
                })
                scheduleOnRN(setSelectedCert, null)
            } else {
                certTranslateY.value = withTiming(0, { duration: 200 })
            }
        })

    const drawerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }]
    }))

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: (translateX.value + DRAWER_WIDTH) / DRAWER_WIDTH
    }))

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }]
    }))

    const certSheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: certTranslateY.value }]
    }))

    const handleRoleSelect = (roleId: RoleId) => {
        setActiveRole(roleId)
        onClose()
    }

    const initialsFrom = (name: string) => {
        const parts = name.trim().split(' ').filter(Boolean)
        return parts.length > 1
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : parts[0]?.slice(0, 2).toUpperCase() ?? ''
    }

    const menuItem = [
        { icon: 'ribbon-outline' as const, label: 'Certifikat', onPress: () => {
            setMenuOpen(false)
            setCertListOpen(true)
        }}
    ]

    function LocationPin({ size = 18, color = '#b65109' }) {
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24">
                <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    fill={color}
                    d="M12 1C6.75 1 2.5 5.13 2.5 9.7c0 1.85.9 3.9 2.1 5.85 1.2 1.95 2.75 3.85 4.15 5.4 1.05 1.16 1.9 2.05 2.55 2.7.38.38.99.38 1.4 0 .65-.65 1.5-1.54 2.55-2.7 1.4-1.55 2.95-3.45 4.15-5.4C20.6 13.6 21.5 11.55 21.5 9.7 21.5 5.13 17.25 1 12 1Zm0 3c3.6 0 6.5 2.55 6.5 5.7 0 1.35-.7 3-1.7 4.65-1 1.65-2.3 3.3-3.5 4.65-.5.56-.94 1.02-1.3 1.38-.36-.36-.8-.82-1.3-1.38-1.2-1.35-2.5-3-3.5-4.65C6.2 12.7 5.5 11.05 5.5 9.7 5.5 6.55 8.4 4 12 4Z"
                />
                <Circle cx="12" cy="9.7" r="2.3" fill={color} />
            </Svg>
        )
    }

    const activeRoleDef = availableRoles.find(r => r.id === activeRole)

    const displayName = certs.length > 0 
        ? `${certs[0].decryptedFields.firstName} ${certs[0].decryptedFields.lastName}`
        : ''

    return (
        <>
            <Animated.View
                style={[styles.overlay, overlayStyle]}
                pointerEvents={visible ? 'auto': 'none'}
            >
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
            </Animated.View>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.drawer, drawerStyle, { paddingTop: insets.top + 20 }]} >
                { activeRole === 'owner' ? (
                    horses.map((record) => (
                        <View key={record.horse.id} style={styles.headerRow}>
                                <View style={styles.headerAvatar}>
                                    <Text style={styles.headerAvatarText}>{initialsFrom(record.horse.name!)}</Text>
                                </View>
                            <View style={styles.headerInfo}>
                                <Text style={styles.headerName} numberOfLines={1}>{record.horse.name}</Text>
                                <View style={styles.headerLocation}>
                                    <Text style={styles.headerLocationText} numberOfLines={1}>Stall Påskarp</Text>
                                    <LocationPin size={14} color="#b65109" />
                                    <Pressable onPress={() => {}} style={styles.checkinButton} hitSlop={10}>
                                        <Text style={styles.checkinLabel}>Check-in</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.headerRow}>
                        <View style={styles.headerAvatar}>
                            <Text style={styles.headerAvatarText}>{initialsFrom(CERTS.breedingOrg.organisationName ?? '')}</Text>
                        </View>
                        <Text style={[styles.headerName, { flex: 1 }]}>{CERTS.breedingOrg.organisationName}</Text>
                    </View>
                )
            }
                <View style={styles.divider} />

                {/* <Pressable onPress={onList} hitSlop={10}>
                    <Text>List tokens</Text>
                </Pressable>
                <View style={{ marginVertical: 12 }}/>
                <Pressable onPress={onRequestList} hitSlop={10}>
                    <Text>Spend all tokens</Text>
                </Pressable>
                <View style={{ marginVertical: 12 }}/>
                <Pressable onPress={onClearDevice} hitSlop={10}>
                    <Text>Clear local data</Text>
                </Pressable> */}

                <View style={{ flex: 1 }} /> 

                {menuOpen && (
                    <>
                        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
                            <View style={[styles.popover, { bottom: insets.bottom +74 }]}>
                                {menuItem.map((item, i) => (
                                    <Pressable key={item.label} onPress={item.onPress} style={styles.menuItem}>
                                        <Ionicons name={item.icon} size={22} color='#574238' />
                                        <Text style={styles.menuLabel}>{item.label}</Text>
                                        <Ionicons name='chevron-forward' size={18} color='#b8ab9e' />
                                    </Pressable>
                                ))}
                            </View>
                        </Pressable>
                    </>
                )}

                <View style={[styles.userRowWrapper, { paddingBottom: insets.bottom + 8 }]}>
                    <Pressable onPress={() => setMenuOpen(true)} style={styles.userRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initialsFrom(displayName)}</Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                            <Text style={styles.userRole} numberOfLines={1}>{activeRoleDef?.label}</Text>
                        </View>
                        <Ionicons name='chevron-expand' size={20} color='#b8ab9e' />
                    </Pressable>
                </View>
                </Animated.View>
            </GestureDetector>

            {certListOpen && (
                <Pressable style={styles.sheetBackdrop} onPress={() => {
                    setCertListOpen(false)
                }} />
            )}
            <GestureDetector gesture={certListPanGesture}>
                <Animated.View style={[styles.sheet, sheetStyle, { paddingBottom: insets.bottom + 16 }]}>
                    <View style={styles.grabber} />

                        <View style={styles.sheetHeader}>
                            <View style={styles.sheetAvatar}>
                                <Text style={styles.sheetAvatarText}>{initialsFrom(displayName)}</Text>
                            </View>
                                <Text style={styles.sheetName}>{displayName}</Text>
                        </View>
                        

                        <Text style={styles.sheetLabel}>CERTIFIKAT</Text>

                        {certRows.map((cert) => {
                            const isActive = activeRole === cert.roleId 
                            return (
                                <View key={cert.roleId} style={[styles.certRow, isActive && styles.certRowActive]}>
                                    <Pressable style={styles.certRowMain} onPress={() => setActiveRole(cert.roleId)}>
                                        <Ionicons name='ribbon-outline' size={22} color='#574238' />
                                        <View style={styles.certInfo}>
                                            <Text style={styles.certRole}>{cert.role}</Text>
                                                { isActive && <Text style={styles.certActiveText}>Aktivt</Text> }
                                            </View>
                                    </Pressable>
                                    <Pressable style={styles.certChevron} onPress={() => setSelectedCert(cert.roleId as 'owner' | 'breedingOrg')}>
                                        <Ionicons name="chevron-forward" size={18} color="#b8ab9e" />
                                    </Pressable>
                                </View>
                            )
                        })}
                </Animated.View>
            </GestureDetector>

            { selectedCert && (
                <Pressable style={styles.certSheetBackdrop} onPress={() => setSelectedCert(null)} />
            )}
            <GestureDetector gesture={certSheetPanGesture}>
                <Animated.View style={[styles.certSheet, certSheetStyle, {paddingBottom: insets.bottom + 20}]}>
                    <View style={styles.grabber} />
                    {selectedCert && <CertificateCard cert={CERTS[selectedCert]} certActive />}
                </Animated.View>
            </GestureDetector>
                </>
            )

}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 10
    },
    drawer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: DRAWER_WIDTH,
        backgroundColor: '#f9f9f9',
        borderRightWidth: 1,
        borderRightColor: '#E8E0D8',
        zIndex: 11,
        paddingHorizontal: 16,
    },
    sectionLabel: {
        fontFamily: 'Inter_300Light',
        fontSize: 12,
        color: '#8a7267',
        marginBottom: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    roleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 4
    },
    roleItem: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E8E0D8',
    },
    roleItemActive: {
        backgroundColor: '#574238',
        borderColor: '#574238',
        borderWidth: 0,
        paddingVertical: 6,
        paddingHorizontal: 11,
    },
    roleText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: '#574238',
    },
    roleTextActive: {
        color: '#fff',
        fontFamily: 'Inter_400Regular',
        fontSize: 12
    },
    divider: {
        height: 1,
        backgroundColor: '#E8E0D8',
        marginTop: 12,
        marginBottom: 16,
    },
    userRowWrapper: {
        borderTopWidth: 0.5,
        borderTopColor: '#E8E0D8',
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 14,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#EAE1D8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#574238',
    },
    userInfo: {
        flex: 1,
        minWidth: 0,
    },
    userName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1b1b1b',
    },
    userRole: {
        fontSize: 12,
        color: '#8a7267',
    },
    menuBackdrop: {
        ...StyleSheet.absoluteFill,
        zIndex: 20,
    },
    popover: {
        position: 'absolute',
        left: 12,
        right: 12,
        backgroundColor: '#fff',
        borderWidth: 0.5,
        borderColor: '#E8E0D8',
        borderRadius: 12,
        padding: 6,
        zIndex: 21,
        shadowColor: '#1a1a1a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        color: '#1b1b1b',
    },
    sheetBackdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 30,
    },
    sheet: {
        position: 'absolute',
        left: 0,
        width: DRAWER_WIDTH,
        bottom: 0,
        height: SHEET_HEIGHT,
        backgroundColor: '#F5F0EB',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        paddingHorizontal: 18,
        zIndex: 31,
    },
    grabber: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#d8ccc0',
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 16,
    },
    sheetHeader: {
        alignItems: 'center',
        gap: 8,
        marginBottom: 22,
    },
    sheetAvatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#EAE1D8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheetAvatarText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#574238',
    },
    sheetName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1b1b1b',
    },
    sheetLabel: {
        fontSize: 11,
        color: '#8a7267',
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    certRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        backgroundColor: '#fff',
        borderWidth: 0.5,
        borderColor: '#E8E0D8',
        borderRadius: 10,
        marginBottom: 8,
        overflow: 'hidden',
    },
    certInfo: {
        flex: 1,
    },
    certRole: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1b1b1b',
    },
    certStatus: {
        fontSize: 12,
        color: '#8a7267',
    },
    certSheetBackdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 40,
    },
    certSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: CERT_SHEET_HEIGHT,
        backgroundColor: '#F5F0EB',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        paddingHorizontal: 20,
        zIndex: 41,
    },
    certRowActive: {
        backgroundColor: '#E3F2FD',
        borderColor: '#E3F2FD',
    },
    certRowMain: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
    },
    certChevron: {
        justifyContent: 'center',
        paddingHorizontal: 14,
    },
    certStatusActive: {
        color: '#1565C0',
    },
    certRoleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        alignSelf: 'flex-start'
    },
    certActiveText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1565C0',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    headerAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#EAE1D8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerAvatarText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#574238',
    },
    headerName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1b1b1b',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flexShrink: 1
    },
    headerLocationText: {
        fontSize: 13,
        color: '#8a7267',
    },
    headerInfo: {
        flex: 1,
    },
    headerLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 1,
    },
    checkinButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    checkinLabel: {
        fontSize: 11,
        color: '#b8ab9e',
    },
})