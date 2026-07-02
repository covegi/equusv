import { StyleSheet, View, Text, Pressable } from "react-native"
import { useState } from "react"
import type { HorsePassport } from "@/types/horse-passport"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import JournalHeader from "./JournalHeader"
import FilterButton from "../buttons/FilterButton"
import PassportCard from "./cards/PassportCard"

export default function HorseJournal({ horse, horseImage, onClose }: { horse: Partial<HorsePassport> | null, horseImage: string, onClose: () => void }) {
     const [isActive, setIsActive] = useState('Alla')

     if (!horse) return null

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
               <JournalHeader horse={horse} horseImage={horseImage} />
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
               <PassportCard horse={horse} />
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