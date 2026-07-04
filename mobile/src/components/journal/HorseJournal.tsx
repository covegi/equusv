import { StyleSheet, View, Text, Pressable } from "react-native"
import { useState } from "react"
import type { HorsePassportRecord } from "@/types/horse-passport-record"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import JournalHeader from "./JournalHeader"
import FilterButton from "../buttons/FilterButton"
import PassportCard from "./cards/PassportCard"
import PassportModal from "../modal/PassportModal"

export default function HorseJournal({ record, horseImage, onClose }: { record: HorsePassportRecord | null, horseImage: string, onClose: () => void }) {
     const [isActive, setIsActive] = useState('Alla')
     const [showEdit, setShowEdit] = useState(false)

     if (!record) return null

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
               <JournalHeader horse={record.horse} horseImage={horseImage} />
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
                    horse={record.horse}
                    status={record.status}
                    onEdit={() => setShowEdit(true)}
               />
               <PassportModal
                    horse={record.horse}
                    visible={showEdit}
                    onClose={() => setShowEdit(false)}
                    onSaved={() => setShowEdit(false)}
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