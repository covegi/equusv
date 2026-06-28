import { StyleSheet, View } from 'react-native'
import React from 'react'

export default function Section({ children }: { children: React.ReactNode }) {
    return (
        <View style={styles.container}>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 16,
        marginBottom: 16
        
    }
})