import { StyleSheet, Text, View, Pressable } from "react-native"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import Entypo from "@expo/vector-icons/Entypo"
import type { BreedingOrgCardProps } from "@/types/breeding-org-card"

export default function BreedingOrgCard({ name, category, taskLabel, breed, sex, birthDate, image, statusText, onPress }: BreedingOrgCardProps) {

    return (
        <Pressable onPress={onPress}>
            <View style={styles.card}>
                <View style={styles.thumb}>
                    <FontAwesome5 name='horse' size={24} color='#E8E0D8' />
                </View>
                <View style={styles.content}>
                    <View style={styles.topRow}>
                        <Text style={styles.name}>{name}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{taskLabel}</Text>
                        </View>
                    </View>
                    <Text style={styles.category}>{category}</Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaText}>Född {birthDate}</Text>
                        <Entypo name="dot-single" size={14} color="#8a7267" />
                        <Text style={styles.metaText}>{sex}</Text>
                        <Entypo name="dot-single" size={14} color="#8a7267" />
                        
                        <Text style={styles.metaText}>{breed}</Text>
                    </View>
                    <Text style={styles.status}>{statusText}</Text>
                </View>
            </View>
        </Pressable>
    )


}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        gap: 12
    },
    thumb: {
        width: 56,
        height: 56,
        borderRadius: 8,
        backgroundColor: '#F5F0EB',
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        flex: 1
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2
    },
    name: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 15,
        color: '#1b1b1b',
    },
    badge: {
        backgroundColor: '#FFF3E0',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    badgeText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 10,
        color: '#B65109',
    },
    category: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 11,
        color: '#B65109',
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    metaRow: {
        flexDirection: 'row'
    },
    metaText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
        color: '#8a7267',
    },
    status: {
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
        color: '#B65109',
        marginTop: 6,
    }
})