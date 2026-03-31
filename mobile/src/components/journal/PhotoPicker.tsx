import { StyleSheet, Pressable, Image, Alert, Linking } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as ImagePicker from 'expo-image-picker'

export default function PhotoPicker({ photoUri, onPhotoSelected }: { photoUri: string, onPhotoSelected: (uri: string, source: 'camera' | 'gallery') => void }) {

    const handlePress = () => {
        Alert.alert('Foto', 'Välj alternativ', [
            {
                text: 'Ta foto',
                onPress: handleCamera
            },
            {
                text: 'Välj från galleri',
                onPress: handleGallery
            },
            {
                text: 'Avbryt',
                style: 'cancel'
            }
        ])
    }

    const handleCamera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync()
        if (!permission.granted) {
            Alert.alert('Behörighet saknas', 'Kameraåtkomst krävs.', [
                {
                    text: 'Öppna inställningar',
                    onPress: () => Linking.openSettings()
                },
                {
                    text: 'Avbryt',
                    style: 'cancel'
                }
            ])
            return
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [26, 10],
            quality: 0.7
        })
        if (!result.canceled) {
            onPhotoSelected(result.assets[0].uri, 'camera')
        }
    }

    const handleGallery = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!permission.granted) {
            Alert.alert('Behörighet krävs', 'Åtkomst till bildbiblioteket krävs.', [
                {
                    text: 'Öppna inställningar',
                    onPress: () => Linking.openSettings()
                },
                {
                    text: 'Avbryt',
                    style: 'cancel'
                }
            ])
            return
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [26, 10],
            quality: 0.7
        })
        if (!result.canceled) {
            onPhotoSelected(result.assets[0].uri, 'gallery')
        }
    }


    return (
        <Pressable onPress={handlePress} style={styles.container}>
            {photoUri
            ? <Image source={{ uri: photoUri }} style={styles.image} resizeMode='cover' />
            : <Ionicons name="camera-outline" size={48} color="#1a1a1a" />
            }
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
    },
    image: {
        height: '100%',
        width: '100%'
    }
})