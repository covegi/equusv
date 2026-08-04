import { StyleSheet, View, Text, Pressable, Dimensions } from "react-native"
import { useEffect, useState } from "react"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRole } from "@/context/RoleContext"
import type { RoleId } from "@/constants/certificates"
import Ionicons from "@expo/vector-icons/Ionicons"
import { CertData } from "@/types/cert-data"
import CertificateCard from "@/features/identity/CertificateCard"

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
        holderName: 'Svenska Fullblodsavelsföreningen',
        certifier: 'Jordbruksverket',
        verificationState: 'unverified',
        serialNumber: '12345',
    },
}

export default function DrawerMenu({ visible, onClose, onList, onRequestList, onClearDevice }: { visible: boolean, onClose: () => void, onList?: () => void, onRequestList?: () => void, onClearDevice?: () => void }) {
    const { activeRole, setActiveRole, availableRoles } = useRole()
    const insets = useSafeAreaInsets()
    const translateX = useSharedValue(-DRAWER_WIDTH)
    const translateY = useSharedValue(SHEET_HEIGHT)
    const [menuOpen, setMenuOpen] = useState(false)
    const [selectedCert, setSelectedCert] = useState<('owner' | 'breedingOrg' | null)>(null)
    const [certListOpen, setCertListOpen] = useState(false)
    const certTranslateY = useSharedValue(CERT_SHEET_HEIGHT)

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
                <Text style={styles.sectionLabel}>Roll</Text>
                <View style={styles.roleRow}>
                {availableRoles.map((role) => (
                    <Pressable
                        key={role.id}
                        style={[
                            styles.roleItem,
                            activeRole === role.id && styles.roleItemActive
                        ]}
                        onPress={() => handleRoleSelect(role.id)}
                    >
                        <Text style={[
                            styles.roleText,
                            activeRole === role.id && styles.roleTextActive
                        ]}>
                            {role.label}
                        </Text>
                    </Pressable>
                ))}
                </View>
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
                            <Text style={styles.avatarText}>{initialsFrom('Peter de Michiel')}</Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName} numberOfLines={1}>{'Peter de Michiel'}</Text>
                            <Text style={styles.userRole} numberOfLines={1}>{'Hästägare'}</Text>
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
                                <Text style={styles.sheetAvatarText}>{initialsFrom('Peter de Michiel')}</Text>
                            </View>
                                <Text style={styles.sheetName}>Peter de Michiel</Text>
                        </View>
                        

                        <Text style={styles.sheetLabel}>CERTIFIKAT</Text>

                        {[
                            { role: 'Hästägare', status: 'Självdeklarerat' },
                            { role: 'Avelsorganisation', status: 'Självdeklarerat' }
                        ].map((cert) => (
                            <Pressable
                                key={cert.role}
                                style={styles.certRow}
                                onPress={() => {
                                    setCertListOpen(false)
                                    setSelectedCert(cert.role === 'Hästägare' ? 'owner' : 'breedingOrg')
                                }}
                            >
                                <Ionicons name='ribbon-outline' size={22} color='#574238' />
                                <View style={styles.certInfo}>
                                    <Text style={styles.certRole}>{cert.role}</Text>
                                    <Text style={styles.certStatus}>{cert.status}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#b8ab9e" />
                            </Pressable>
                        ))}
                </Animated.View>
            </GestureDetector>

            { selectedCert && (
                <Pressable style={styles.certSheetBackdrop} onPress={() => setSelectedCert(null)} />
            )}
            <GestureDetector gesture={certSheetPanGesture}>
                <Animated.View style={[styles.certSheet, certSheetStyle, {paddingBottom: insets.bottom + 20}]}>
                    <View style={styles.grabber} />
                    {selectedCert && <CertificateCard cert={CERTS[selectedCert]} />}
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
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#fff',
        borderWidth: 0.5,
        borderColor: '#E8E0D8',
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
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
})