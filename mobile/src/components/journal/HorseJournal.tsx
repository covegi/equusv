import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react'
import Feather from '@expo/vector-icons/Feather'
import Ionicons from '@expo/vector-icons/Ionicons'

import Section from './Section'
import SectionHeading from './SectionHeading'
import SectionRow from './SectionRow'
import type { HorsePassport } from '@/types/horse-passport'
import { fetchFromUhrp } from '@/utils/uhrp'

export default function HorseJournal({ horse }: { horse: HorsePassport }) {
     const [image, setImage] = useState<string | null>(null)
     const [isLoading, setIsLoading] = useState(false)

     useEffect(() => {
          const fetchImage = async () => {
               setIsLoading(true)

               if (!horse.photoUhrp) {
                    setIsLoading(false)
                    return
               }
     
               try {
                    console.log('calling fetchFromUhrp...')

                    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
                    for (let attempt = 0; attempt < 5; attempt++) {
                         try {
                              const dataUri = await fetchFromUhrp({ uhrpUrl: horse.photoUhrp })
                              setImage(dataUri)
                              setIsLoading(false)
                              return
                         } catch (error) {
                              if (attempt < 4) {
                                   await wait(2000)
                              }
                         }
                    }
                    setIsLoading(false)
               } catch (error) {
                    console.error('fetchImage error:', error)
                    setIsLoading(false)
               }
          }
          fetchImage().catch(error => console.error('unhandled fetchImage error:', error))
     }, [horse.photoUhrp])

    return (
        <View style={styles.outerContainer}>
           <View style={styles.imagePlaceholder}>
               {isLoading
                    ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 30, gap: 12 }}>
                         <ActivityIndicator color="#C8963E" size="small" />
                         <Text style={styles.iconText}>Hämtar krypterad bild...</Text>
                    </View>
                    : image 
                         ? <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                         : <Ionicons name="camera-outline" size={48} color="#1a1a1a" />
               }
           </View>
           <TouchableOpacity style={styles.editIcon}>
                <Feather name="edit-3" size={18} color="#1a1a1a"/>
           </TouchableOpacity>
           <Section>
                <SectionHeading>Häst:</SectionHeading>
                <SectionRow label='Namn' value={horse.name} />
                <SectionRow label='Ras' value={horse.breed} />
                <SectionRow label='Född' value={horse.birthDate} />
                <SectionRow label='Kön' value={horse.sex} />
                <SectionRow label='Färg' value={horse.color} />
                <SectionRow label='UELN' value={horse.ueln} />
                <SectionRow label='Chip' value={horse.chip} />
           </Section>
           <Section>
                <SectionHeading>Ägare:</SectionHeading>
                <SectionRow label='Ägare' value={horse.ownerAtRegistration} />
                <SectionRow label='Ort' value={horse.location} />
           </Section>
           <Section>
                <SectionHeading>Utfärdare:</SectionHeading>
                <SectionRow label='Organisation' value={horse.organisation} />
                <SectionRow label='Utfärdat' value={horse.issuedDate} />
           </Section>
           <Section>
                <SectionHeading>Livsmedelskedjan:</SectionHeading>
                <SectionRow label='Status' value={horse.foodChainStatus ? 'Ingår' : 'Ingår ej'} />
           </Section>
        </View>
    )
}

const styles = StyleSheet.create({
    outerContainer: {
        height: 580,
        paddingHorizontal: 15,
        marginBottom: 10,
        backgroundColor: '#f7f2f2',
        borderRadius: 10
    },
    imagePlaceholder: {
            width: '100%',
            height: 150,
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderColor: '#1a1a1a',
            borderWidth: 2,
            marginTop: 15
    },
    editIcon: {
        position: 'absolute',
        top: 180,
        right: 15
    },
    iconText: {
     fontFamily: 'Inter_400Regular',
     fontSize: 12,
     color: '#1a1a1a'
 },
})