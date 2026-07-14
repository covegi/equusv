import { StyleSheet, View, Text, FlatList } from "react-native"
import { useState } from 'react'

import Header from "@/components/header/header"
import DrawerMenu from "@/components/navigation/DrawerMeny"
import BreedingOrgCard from "./BreedingOrgCard"

const DUMMY = [
    { id: '1', name: 'Molly', category: 'IDENTITET', taskLabel: 'Passansökan', breed: 'Welsh', sex: 'Sto', birthDate: '2026-02-17', statusText: 'Väntar på granskning' },
    { id: '2', name: 'Sally', category: 'AVEL', taskLabel: 'Betäckningsrapport', breed: 'Gotlandsruss', sex: 'Sto', birthDate: '2021-10-05', statusText: 'Väntar på registrering' },
]

export default function BreedingOrgScreen() {
    const [drawerVisible, setDrawerVisible] = useState(false)

    const onPress = () => {}

    let content

    if (DUMMY.length === 0) {
        content = (
            <View style={styles.centerContainer}>
                <Text style={styles.iconText}>Inga inkomna ärenden</Text>
            </View>
            )
        } else {
            content = (
                <FlatList
                    data={DUMMY}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => 
                        <BreedingOrgCard
                            name={item.name}
                            category={item.category}
                            taskLabel={item.taskLabel}
                            breed={item.breed}
                            sex={item.sex}
                            birthDate={item.birthDate}
                            statusText={item.statusText}
                            onPress={() => onPress}
                        />
                    }
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