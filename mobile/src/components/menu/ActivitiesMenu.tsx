import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native"
import { useState, useEffect } from 'react'
import AntDesign from "@expo/vector-icons/AntDesign"
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"
import { useRouter, usePathname } from "expo-router"
import { useActivitesMenu } from "@/context/ActivitiesMenuContext"

const menuItems = [
    { label: 'Hästpass', icon: 'passport', route: '/passport'}
] as const

export default function ActivitiesMenu() {
    const router = useRouter()
    const pathname = usePathname()
    const { menuVisible, setMenuVisible } = useActivitesMenu()
    const [internalVisible, setInternalVisible] = useState(false)
    const [pendingRoute, setPendingRoute] = useState<string | null>(null)
    
    useEffect(() => {
        if (menuVisible) setInternalVisible(true)
    }, [menuVisible])

    if (!internalVisible) return null
    
    return (
        <Modal 
            visible={menuVisible}
            transparent={false}
            animationType='slide'
            onRequestClose={() => setMenuVisible(false)}
            onDismiss={() => {
                setInternalVisible(false)
                if (pendingRoute) {
                    router.replace(pendingRoute as any)
                    setPendingRoute(null)
                }
            }}
        >
            <View 
                style={[styles.menuContainer]}>
                <View>
                    <View style={styles.closeIconContainer}>
                        <Text style={styles.menuText}>Aktiviteter</Text>
                        <TouchableOpacity
                            onPress={() => setMenuVisible(false)}
                            style={[styles.closeIcon]}>
                            <AntDesign name="close" size={24} color='#1a1a1a' />
                        </TouchableOpacity>
                        
                    </View>
                       {menuItems.map((item) => (
                            <TouchableOpacity
                                key={item.route}
                                onPress={() => {
                                       setPendingRoute(item.route)
                                       setMenuVisible(false) 
                                }}
                                >
                                <View style={styles.listItemContainer}>
                                    <FontAwesome6 name={item.icon} size={30} color="#1a1a1a" />
                                    <Text style={styles.listItemText}>{item.label}</Text>
                                </View>
                        </TouchableOpacity>
                       ))}
                        
                </View>
            </View>
        </Modal>
        )
    }

const styles = StyleSheet.create({
    menuContainer: {
        height: '100%',
        width: '100%',
        backgroundColor: '#f7f2f2',
    },
    closeIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 25
    },
    closeIcon: {
        justifyContent: 'flex-start',
        paddingLeft: 25,
        paddingTop: 60,
        marginBottom: 20
    },
    menuText: {
        color: '#1a1a1a',
        fontFamily: 'Inter_600SemiBold',
        fontSize: 22,
        paddingTop: 40,
    },
    listItemContainer: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 25
    },
    listItemText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 18,
        paddingLeft: 20,
        color: '#1a1a1a'
    }
})