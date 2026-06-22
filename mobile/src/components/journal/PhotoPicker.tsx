import { StyleSheet, Pressable, Image, Alert, Linking } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import * as ImagePicker from 'expo-image-picker'

export default function PhotoPicker({ photoUri, onPhotoSelected }: { photoUri: string, onPhotoSelected: (uri: string, source: 'camera' | 'gallery') => void }) {

    const handlePress = () => {
        console.log('handlePress called, photoUri:', photoUri)
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
            : <MaterialIcons name="add-photo-alternate" size={40} color="#aaaaaa" />
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
        marginTop: 15,
    },
    image: {
        height: '100%',
        width: '100%',
    }
})