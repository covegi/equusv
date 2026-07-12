import { StyleSheet, View, Text, Pressable } from "react-native"
import { useState } from 'react'

import Header from "@/components/header/header"
import DrawerMenu from "@/components/navigation/DrawerMeny"



export default function BreedingOrgScreen() {
    const [drawerVisible, setDrawerVisible] = useState(false)

    return (
        <>
            <View style={styles.outerContainer}>
                <Header onMenuPress={() => setDrawerVisible(true)} />
                <View style={styles.centerContainer}>
                    <Text style={styles.iconText}>Inga inkomna ärenden</Text>
                </View>
            </View>
            <DrawerMenu 
                visible={drawerVisible}
                onClose={() => setDrawerVisible(false)}
            />
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