import { StyleSheet, View, Text, Pressable, Dimensions} from "react-native"
import { useEffect } from "react"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRole } from "@/context/RoleContext"
import type { RoleId } from "@/constants/certificates"

const SCREEN_WIDTH = Dimensions.get('window').width
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75
const CLOSE_THRESHOLD = DRAWER_WIDTH * 0.3

export default function DrawerMenu({ visible, onClose }: { visible: boolean, onClose: () => void }) {
    const { activeRole, setActiveRole, availableRoles } = useRole()
    const insets = useSafeAreaInsets()
    const translateX = useSharedValue(-DRAWER_WIDTH)

    useEffect(() => {
        translateX.value = withTiming(visible ? 0 : -DRAWER_WIDTH, { duration: 250 })
    }, [visible])

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

    const drawerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }]
    }))

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: (translateX.value + DRAWER_WIDTH) / DRAWER_WIDTH
    }))

    const handleRoleSelect = (roleId: RoleId) => {
        setActiveRole(roleId)
        onClose()
    }

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
})