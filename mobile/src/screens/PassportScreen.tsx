import { StyleSheet, View, FlatList } from 'react-native'
import { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import * as SecureStore from 'expo-secure-store'

import PassportCard from '@/components/passport/PassportCard'
import { HorsePassportDraft } from '@/types/horse-passport-draft'
import { HorsePassport } from '@/types/horse-passport'
import { usePassportModal } from '@/context/PassportModalContext'
import PassportModal from '@/components/modal/PassportModal'

export default function PassportScreen() {
    const [drafts, setDrafts] = useState<HorsePassportDraft[]>([])
    const [passports, setPassports] = useState<HorsePassport[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [refresh, setRefresh] = useState(0)
    const { visible, setVisible } = usePassportModal()

    useEffect(() => {
        const fetchDrafts = async () => {
            try {
                const storedUelns = await SecureStore.getItemAsync('horseUelns')
                console.log('storedUelns:', storedUelns)
                const uelns: string[] = storedUelns ? JSON.parse(storedUelns) : []
                console.log('uelns:', uelns)
                
                const fetchedDrafts = await Promise.all(
                uelns.map(async (ueln) => {
                    const stored = await SecureStore.getItemAsync(`passport-draft-${ueln}`)
                    console.log(`passport-draft-${ueln}:`, stored)
                    return stored ? JSON.parse(stored) as HorsePassportDraft : null
                    })
                )
                console.log('validDrafts:', fetchedDrafts)
                const validDrafts = fetchedDrafts.filter(draft => draft !== null) as HorsePassportDraft[]
                setDrafts(validDrafts)
            } catch (error) {
                console.error(error)
            }
        } 
        fetchDrafts()
    }, [refresh])

    const handleOnDelete = async (ueln: string) => {
       try {
        const storedUelns = await SecureStore.getItemAsync('horseUelns')
        const uelns: string[] = storedUelns ? JSON.parse(storedUelns) : []
        const updatedUelnsList = uelns.filter(item => item !== ueln)

        await Promise.all([
            SecureStore.setItemAsync('horseUelns', JSON.stringify(updatedUelnsList)),
            SecureStore.deleteItemAsync(`passport-draft-${ueln}`)
        ])
        
        setRefresh(n => n + 1)
       
        } catch (error) {
            console.error('handleOnDelete error:', error)
        }
    }


    return (
        <View style={styles.container}>
            <PassportModal
                visible={visible}
                onSaved={() => setRefresh(n => n + 1)}
                onClose={() => setVisible(false)}
            />
            <FlatList
                data={drafts}
                keyExtractor={(item) => item.horse.ueln}
                renderItem={({ item }) => (
                    <PassportCard
                        horse={item.horse}
                        status={item.status}
                        onDelete={() => handleOnDelete(item.horse.ueln)}
                    />
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    
})