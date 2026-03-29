import { StyleSheet, View, TouchableOpacity } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

import PhotoPicker from './PhotoPicker'
import Section from './Section'
import SectionHeading from './SectionHeading'
import SectionRow from './SectionRow'
import type { Horse } from '@/types/horse'


export default function HorseJournal({ horse }: { horse: Horse }) {
    return (
        <View style={styles.outerContainer}>
           <PhotoPicker />
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
                <SectionRow label='Ägare' value={horse.owner} />
                <SectionRow label='Ort' value={horse.location} />
           </Section>
           <Section>
                <SectionHeading>Utfärdare:</SectionHeading>
                <SectionRow label='Organisation' value={horse.organisation} />
                <SectionRow label='Utfärdat' value={horse.issuedDate} />
           </Section>
           <Section>
                <SectionHeading>Livsmedelskedjan:</SectionHeading>
                <SectionRow label='Status' value={horse.foodChainStatus} />
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
    editIcon: {
        position: 'absolute',
        top: 180,
        right: 15
    }
})