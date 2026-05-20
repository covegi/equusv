import { StyleSheet, Text, View, TouchableOpacity } from "react-native"
import Feather from '@expo/vector-icons/Feather'

import type { HorsePassport } from "@/types/horse-passport"
import Heading from "../text/Heading"
import CardButton from "../buttons/CardButton"


export default function PassportCard({ horse, status='draft', onDelete, onCertify, onRevoke, onEdit, onBroadcast }: { horse: HorsePassport, status: string, onDelete?: () => void, onCertify?: () => void, onRevoke?: () => void, onEdit?: () => void, onBroadcast?: () => void }) {

    const statusLabel = {
        draft: 'Utkast',
        pending: 'Väntar',
        revision: 'Revision',
        approved: 'Godkänt',
        active: 'Aktivt'
    }[status]

    const statusContainer = {
        draft: styles.draftContainer,
        pending: styles.pendingContainer,
        revision: styles.revisionContainer,
        approved: styles.approvedContainer,
        active: styles.activeContainer
    }[status]

    const statusText = {
        draft: styles.draftText,
        pending: styles.pendingText,
        revision: styles.revisionText,
        approved: styles.approvedText,
        active: styles.activeText
    }[status]

    let buttonBox

    if (status === 'draft') {
        buttonBox = 
                <View style={styles.buttonBoxContainer}>
                    <CardButton variant='primary' onPress={() => onCertify?.()}>Skicka för certifiering</CardButton>
                    <CardButton variant='danger' onPress={() => onDelete?.()}>Ta bort</CardButton>
                </View>
            
    } else if (status === 'pending') {
        buttonBox = 
            <View style={styles.buttonBoxContainer}>
                <CardButton variant='ghost' onPress={() => {}}>Inväntar svar från avelsorganisation</CardButton>
                <CardButton variant='danger' onPress={() => onRevoke?.()}>Dra tillbaka</CardButton>
            </View>
    } else if (status === 'revision') {
        buttonBox = 
            <View style={styles.buttonBoxContainer}>
                <CardButton variant='primary' onPress={() => {}}>Uppdatera</CardButton>
                <CardButton variant='danger' onPress={() => {}}>Ta bort</CardButton>
            </View>
    } else if (status === 'approved') {
        buttonBox = 
            <View style={styles.buttonBoxContainer}>
                <CardButton variant='success' onPress={() => onBroadcast?.()}>Bekräfta och betala</CardButton>   
            </View>
    } else if (status === 'active') {
        buttonBox = 
        <View style={styles.buttonBoxContainer}>
            <CardButton variant='ghost' onPress={() => {}}>Visa pass</CardButton>
        </View>
    }

    let statusButton

    if (status === 'draft' || status === 'revision') {
        statusButton = 
            <TouchableOpacity onPress={() => onEdit?.()}>
                <View style={styles.statusButtonContainer}>
                    <Feather name="edit" size={12} color="#aaaaaa" />
                    <Text style={[styles.statusText, statusText]}>{statusLabel}</Text>
                </View>
            </TouchableOpacity>
       
    } else {
        statusButton = <Text style={[styles.statusText, statusText]}>{statusLabel}</Text>
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Heading>{horse.name}</Heading>
                    <View style={[styles.statusContainer, statusContainer]}>
                        {statusButton}
                    </View>
            </View>
            <View style={styles.uelnContainer}>
                <Text style={styles.uelnText}>{horse.ueln}</Text>
            </View>
            {buttonBox}
            
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        marginHorizontal: 15,
        marginTop: 10,
        borderRadius: 10,
        backgroundColor: '#2a2a2a'
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusContainer: {
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: '#444444'
    },
    statusButtonContainer: {
        flexDirection: 'row',
        gap: 8
    },
    statusText: {
        fontFamily: 'Inter_300Light',
        color: '#aaaaaa',
        fontSize: 12
    },
    uelnContainer: {
        flexDirection: 'row',
        marginTop: 4,
        marginBottom: 8
    },
    uelnText: {
        fontFamily: 'Inter_300Light',
        color: '#888888',
        fontSize: 13
    },
    buttonBoxContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10
    },
    draftContainer: {
        backgroundColor: '#333333'
    },
    pendingContainer: {
        backgroundColor: '#2a2a1a'
    },
    revisionContainer: {
        backgroundColor: '#2a1a1a'
    },
    approvedContainer: {
        backgroundColor: '#1a2a1a'
    },
    activeContainer: {
        backgroundColor: '#1a2535'
    },
    draftText: {
        color: '#aaaaaa'
    },
    pendingText: {
        color: '#C8963E'
    },
    revisionText: {
        color: '#c05050'
    },
    approvedText: {
        color: '#5a9966'
    },
    activeText: {
        color: '#5a9fd4'
    }

})