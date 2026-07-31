import { StyleSheet, View, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import { useState, useEffect, useMemo } from "react"
import type { HorsePassportRecord } from "@/types/horse-passport-record"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import JournalHeader from "./JournalHeader"
import FilterButton from "../buttons/FilterButton"
import PassportCard from "./cards/PassportCard"
import PassportModal from "../modal/PassportModal"
import { useRole } from "@/context/RoleContext"
import { journalPermissions } from "@/config/journalPermissions"

export default function HorseJournal({ record, horseImage, onClose, onDelete, onSend, onApprove, onRevision, onRefresh }: { record: HorsePassportRecord | null, horseImage?: string, onClose: () => void, onDelete?: (id: string) => void, onSend?: (record: HorsePassportRecord) => void, onApprove?: (record: HorsePassportRecord) => void, onRevision?: (record: HorsePassportRecord, comment: string) => void, onRefresh?: () => void }) {
     const [isActive, setIsActive] = useState('Alla')
     const [showEdit, setShowEdit] = useState(false)
     const [currentRecord, setCurrentRecord] = useState(record)
     const { activeRole } = useRole()
     const allowedCategories = journalPermissions[activeRole]
     const [containerWidth, setContainerWidth] = useState(0)
     const [pillWidths, setPillWidths] = useState<number[]>([])
     const [showDropdown, setShowDropdown] = useState(false)

     const GAP = 12
     const DOTS_WIDTH = 50

     const filterBtns = allowedCategories.map((cat => ({
          title: cat
     })))

     const visibleCount = useMemo(() => {
          if (!containerWidth || pillWidths.length < filterBtns.length) return filterBtns.length
          let total = 0
          for (let i = 0; i < pillWidths.length; i++) {
               const next = total + pillWidths[i] + (i > 0 ? GAP: 0)
               if (next + DOTS_WIDTH + GAP > containerWidth) return i
               total = next
          }
          return pillWidths.length
     }, [containerWidth, pillWidths, filterBtns]) 

     const visibleBtns = filterBtns.slice(0, visibleCount)
     const overflowBtns = filterBtns.slice(visibleCount)

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
                    { text: 'Radera', style: 'destructive', onPress: () => onDelete?.(currentRecord.horse.id!)}
               ]
          )
     }

     const handleSend = () => {
          console.log('handleSendDraft called, id:', currentRecord.horse.id)
          if (!currentRecord.horse.id) return
          Alert.alert(
               'Skicka till avelsorganisation',
               `Vill du skicka ansökan för ${currentRecord.horse.name?.trim() ?? 'denna häst'}?`,
               [
                    { text: 'Avbryt', style: 'cancel' },
                    { text: 'Skicka', style: 'default', onPress: () => onSend?.(currentRecord) }
               ]
          )
     }

     const handleApprove = () => {
          if (!currentRecord.horse.id) return
          Alert.alert(
               'Godkänn ansökan',
               `Vill du godkänna passansökan för ${currentRecord.horse.name?.trim() ?? 'denna häst'}?`,
               [
                    { text: 'Avbryt', style: 'cancel'},
                    { text: 'Godkänn', style: 'default', onPress: () => onApprove?.(currentRecord) }
               ]
          )
     }

     return (
         <KeyboardAvoidingView
               style={styles.outerContainer}
               behavior={Platform.OS === 'ios' ? 'padding' : undefined}
               keyboardVerticalOffset={60}
               >
               <Pressable onPress={onClose} style={styles.closeBtn}>
                    <FontAwesome name='angle-down' size={40} color='#574238' />
               </Pressable>
               {pillWidths.length < filterBtns.length && (
                    <View style={{ flexDirection: 'row', position: 'absolute', opacity: 0}}>
                         {filterBtns.map((btn, i) => (
                              <FilterButton 
                                   key={btn.title}
                                   onPress={() => {}}
                                   onLayout={(e) => {
                                        const width = e.nativeEvent.layout.width
                                        setPillWidths(prev => {
                                             const next = [...prev]
                                             next[i] = width
                                             return next
                                        })
                                   }}
                                   isActive={false}
                              >{btn.title}</FilterButton>
                         ))}
                    </View>
               )}
               
               <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
               >
               <JournalHeader horse={currentRecord.horse} horseImage={horseImage} />
               <View
                    style={styles.filterButtonContainer}
                    onLayout={(e) => {
                         const width = e.nativeEvent.layout.width
                         setContainerWidth(width - 24)
                    }}
               >
                    {visibleBtns.map((btn, i) => (
                         <FilterButton
                              key={btn.title}
                              isActive={isActive === btn.title}
                              onPress={() => setIsActive(btn.title)}
                         >{btn.title}
                         </FilterButton>
                    ))}
                    {overflowBtns.length > 0 && (
                        <FilterButton 
                              isActive={false}
                              onPress={() => setShowDropdown(!showDropdown)}
                        >...</FilterButton>
                    )}
               </View>
               <PassportCard
                    horse={currentRecord?.horse}
                    status={currentRecord!.status}
                    revisionComment={currentRecord?.revisionComment}
                    onEdit={() => setShowEdit(true)}
                    onDelete={handleDelete}
                    onSend={handleSend}
                    onRevision={(comment) => onRevision?.(currentRecord!, comment)}
                    onRefresh={() => onRefresh?.()}
                    onApprove={handleApprove}
               />
                </ScrollView>
               <PassportModal
                    horse={currentRecord!.horse}
                    visible={showEdit}
                    onClose={() => setShowEdit(false)}
                    onSaved={(updatedDraft) => {
                         setCurrentRecord(updatedDraft)
                         setShowEdit(false)
                    }}
                    />
               </KeyboardAvoidingView>
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
          flexDirection: 'row',
     },
     dotsBtn: {
          fontFamily: 'Inter_400Regular',
          fontSize: 14,
          color: '#574238',
          paddingHorizontal: 12,
          paddingVertical: 8,
      },
})