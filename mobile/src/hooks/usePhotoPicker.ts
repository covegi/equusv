import { Alert, Linking } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

export default function usePhotoPicker(onPhotoSelected: (uri: string, source: 'camera' | 'gallery') => void)  {

    const handleCamera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync()
        if (!permission.granted) {
            Alert.alert('Behörighet saknas', 'Kameraåtkomst krävs', [
                {
                    'text': 'Öppna inställningar',
                    onPress: () => Linking.openSettings()
                },
                {
                    'text': 'Avbryt',
                    'style': 'cancel'
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
                    'text': 'Öppna inställngar',
                    onPress: () => Linking.openSettings()
                },
                {
                    'text': 'Avbryt',
                    'style': 'cancel'
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

    const handlePicker = () => {
        Alert.alert('Foto', 'Välj alternativ', [
            {
                'text': 'Ta foto',
                onPress: handleCamera
            },
            {
                'text': 'Välj från galleri',
                onPress: handleGallery
            },
            {
                'text': 'Avbryt',
                style: 'cancel'
            }
        ])
    }
    return { showPicker: handlePicker }
}