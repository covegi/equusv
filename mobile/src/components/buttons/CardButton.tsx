import { StyleSheet, Text, View, TouchableOpacity } from "react-native"

export default function CardButton({ children, onPress, variant='primary' }: { children: string, onPress: () => void, variant: 'primary' | 'ghost' | 'danger' | 'success' }) {

    const containerStyle = {
        primary: styles.primary,
        ghost: styles.ghost,
        danger: styles.danger,
        success: styles.success
    }[variant]

    const labelContainer = {
        primary: styles.labelPrimary,
        ghost: styles.labelGhost,
        danger: styles.labelDanger,
        success: styles.labelSuccess
    }[variant]

    return (
        <TouchableOpacity onPress={onPress} style={[styles.container, containerStyle]}>
                <Text style={[styles.label, labelContainer]}>{children}</Text>
        </TouchableOpacity>
        
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
        flex: 1
    },
    primary: {
        backgroundColor: '#C8963E'
    },
    ghost: {
        backgroundColor: '#333333'
    },
    danger: {
        backgroundColor: '#2a1a1a'
    },
    success: {
        backgroundColor: '#1a3a1a'
    },
    label: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        fontWeight: '500'
    },
    labelPrimary: {
        color: '#1a1a1a',
    },
    labelGhost: {
        color: '#555555',
    },
    labelDanger: {
        color: '#c05050',
    },
    labelSuccess: {
        color: '#5a9966',
    }
})