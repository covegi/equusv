import { StyleSheet, View, Text, Pressable, Alert } from "react-native"
import { useState, useEffect } from "react"
import type { HorsePassportRecord } from "@/types/horse-passport-record"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import JournalHeader from "./JournalHeader"
import FilterButton from "../buttons/FilterButton"
import PassportCard from "./cards/PassportCard"
import PassportModal from "../modal/PassportModal"

export default function HorseJournal({ record, horseImage, onClose, onDelete }: { record: HorsePassportRecord | null, horseImage: string, onClose: () => void, onDelete: (id: string) => void }) {
     const [isActive, setIsActive] = useState('Alla')
     const [showEdit, setShowEdit] = useState(false)
     const [currentRecord, setCurrentRecord] = useState(record)

     useEffect(() => {
          setCurrentRecord(record)
     }, [record])

     if (!currentRecord) return null

     const handleDelete = () => {
          console.log('handleDelete called, id:', currentRecord.horse.id)
          if (!currentRecord.horse.id) return
          Alert.alert(
               'Radera utkast',
               `Vill du radera utkast för ${currentRecord.horse.name ?? 'denna häst'}?`,
               [
                    { text: 'Avbryt', style: 'cancel' },
                    { text: 'Radera', style: 'destructive', onPress: () => onDelete(currentRecord.horse.id!)}
               ]
          )
     }

     const filterBtns = [
          { title: 'Alla', disabled: false },
          { title: 'Identitet', disabled: false },
          { title: 'Hälsa', disabled: true },
          { title: '...', disabled: true }
     ]

     return (
         <View style={styles.outerContainer}>
               <Pressable onPress={onClose} style={styles.closeBtn}>
                    <FontAwesome name='angle-down' size={40} color='#574238' />
               </Pressable>
               <JournalHeader horse={currentRecord.horse} horseImage={horseImage} />
               <View style={styles.filterButtonContainer}>
                    {filterBtns.map((btn) => (
                         <FilterButton
                              key={btn.title}
                              isActive={isActive === btn.title}
                              disabled={btn.disabled}
                              onPress={() => setIsActive(btn.title)}
                         >{btn.title}
                         </FilterButton>
                    ))}
               </View>
               <PassportCard
                    horse={currentRecord?.horse}
                    status={currentRecord!.status}
                    onEdit={() => setShowEdit(true)}
                    onDelete={handleDelete}
               />
               <PassportModal
                    horse={currentRecord!.horse}
                    visible={showEdit}
                    onClose={() => setShowEdit(false)}
                    onSaved={(updatedDraft) => {
                         setCurrentRecord(updatedDraft)
                         setShowEdit(false)
                    }}
                    />
         </View>
     )
}

const styles = StyleSheet.create({
     outerContainer: {
          flex: 1,
          backgroundColor: '#F5F0EB',
     },
     closeBtn: {
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 6,
     },
     filterButtonContainer: {
          flexDirection: 'row'
     }
})