    import { StyleSheet, Text, View, Image, ActivityIndicator, Pressable } from 'react-native'
    import { useState, useMemo } from 'react'
    import { Utils, AuthFetch, PublicKey, ECIES } from '@bsv/sdk'
    import { File } from 'expo-file-system'
    import { useWallet } from '@/context/WalletContext' 
    import type { HorsePassport } from '@/types/horse-passport'
    import PhotoPicker from './PhotoPicker'
    import FontAwesome5 from '@expo/vector-icons/FontAwesome5'

    const TOKEN_SERVER = process.env.EXPO_PUBLIC_TOKEN_SERVER_URL

    export default function HorseListCard({ horse, horseImage, onPhotoUploaded, isLoadingImage, onPress }: { horse: HorsePassport, horseImage: string | null, onPhotoUploaded: (ueln: string, dataUri: string) => void, isLoadingImage: boolean, onPress: (horse: HorsePassport) => void }) {
        const [uhrpUrl, setUhrpUrl] = useState<string | null>(null)
        const [isUploadingImage, setIsUploadingImage] = useState(false)
        const { wallet } = useWallet()

        const authFetch = useMemo(() => {
            if (!wallet) return
            return new AuthFetch(wallet)    
        }, [wallet])

        const handlePhotoSelected = async (uri: string, source: 'camera' | 'gallery') => {
            setIsUploadingImage(true)

            try {
                const file = new File(uri)
            const bytes = await file.bytes()
            const base64Uri = Utils.toBase64(Array.from(bytes))
            const response = await authFetch?.fetch(`${TOKEN_SERVER}/identity/file/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        base64body: base64Uri,
                        ueln: horse.ueln,
                        tokenType: 'photo',
                        mimeType: 'image/jpeg',
                        description: '',
                        parentTxid: '',
                        identityKey: wallet?.identityKey
                    }
                )
            })
            const { uhrpUrl } = await response?.json()
            onPhotoUploaded(horse.ueln, uri)
            console.log('onPhotoUploaded called with:', horse.ueln, uri)
            console.log('UHRPURL:', uhrpUrl)
            setUhrpUrl(uhrpUrl)
            } catch (error) {
                console.error('Upload failed:', error)
            } finally {
                setIsUploadingImage(false)
            }
        }

        let content

        if (isLoadingImage || isUploadingImage) {
            content = <View style={styles.placeholder}>
             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                    <ActivityIndicator color='#C8963E' size="small" />
                    <Text style={styles.iconText}>{isLoadingImage ? 'Hämtar bild...' : 'Sparar bild...'}</Text>
                </View>
            </View>
        } else if (horseImage === null) {
            content = <View style={styles.placeholder}>
                            <PhotoPicker
                                photoUri={horseImage ?? ''}
                                onPhotoSelected={handlePhotoSelected}
                            />
                        </View>
        } else {
            content = 
            <View style={styles.placeholder}>
                {horseImage && (
                    <Image source={{ uri: horseImage }} resizeMode='cover' style={styles.absoluteFill} />
                )}
                <PhotoPicker 
                    photoUri={horseImage ?? ''}
                    onPhotoSelected={handlePhotoSelected}
                />
            </View>
        }

        console.log('horseImage prop:', horseImage?.substring(0, 50))

        return (
            <Pressable onPress={() => onPress(horse)}>
                <View style={styles.outerContainer}>
                    <View>  
                    {content}
                        <View style={styles.textContainer}>
                            <Text style={styles.name}>{horse.name}</Text>
                            <Text style={styles.ueln}>{horse.ueln}</Text>
                        </View>
                    </View>
                </View>
            </Pressable>
            
        )
    }

    const styles = StyleSheet.create({
        outerContainer: {
            width: '100%',
            height: 230,
            backgroundColor: '#1a1a1a',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
        },
        placeholder: {
            height: 165,
            aspectRatio: 16/9,
            resizeMode: 'contain',
            backgroundColor: '#2a2a2a',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            marginBottom: 2,
            overflow: 'hidden'
        },
        absoluteFill: {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        },
        textContainer: {
            marginTop: 6,
        },
        name: {
            fontFamily: 'Inter_600SemiBold',
            color: '#f7f2f2',
            fontSize: 20,
            paddingBottom: 2
        },
        ueln: {
            fontFamily: 'Inter_300Light',
            color: '#f7f2f2',
            fontSize: 12
        },
        iconText: {
            fontFamily: 'Inter_300Light',
            fontSize: 12,
            color: '#f7f2f2'
        }
    })