import { StyleSheet, Pressable } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'

export default function PhotoPicker() {
    
    return (
        <Pressable style={styles.container}>
            <Ionicons name="camera-outline" size={48} color="#1a1a1a" />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
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
    }
})