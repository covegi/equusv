import { StyleSheet, View, Modal, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as FileSystem from 'expo-file-system/legacy'
import * as SecureStore from 'expo-secure-store'
import { PrivateKey, ECIES, AuthFetch } from '@bsv/sdk'
import { useWallet } from '@/context/WalletContext'

import Heading from '../text/Heading'
import PhotoPicker from '../journal/PhotoPicker'
import Section from '../journal/Section'
import SectionHeading from '../journal/SectionHeading'
import SectionRowInput from '../journal/SectionRowInput'
import SectionRowDateInput from '../journal/SectionRowDateInput'
import SectionRowCheckbox from '../journal/SectionRowCheckbox'
import type { Horse } from '@/types/horse'
import PrimaryButton from '../buttons/PrimaryButton'

export default function HorseModal({ visible, onClose }: {visible: boolean, onClose: () => void }) {
    const insets = useSafeAreaInsets()
    const [horse, setHorse] = useState<Partial<Horse>>({})
    const [errors, setErrors] = useState<Partial<Record<keyof Horse, boolean>>>({})
    const [photoUri, setPhotoUri] = useState<string | null>(null)
    const [photoSource, setPhotoSource] = useState<'camera' | 'gallery' | null>(null)
    const { wallet } = useWallet()

    const CERT_SERVER_URL = process.env.EXPO_PUBLIC_CERT_SERVER_URL

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof Horse, boolean>> = {}
        if (!horse.name) newErrors.name = true
        if (!horse.breed) newErrors.breed = true
        if (!horse.birthDate) newErrors.birthDate = true
        if (!horse.sex) newErrors.sex = true
        if (!horse.color) newErrors.color = true
        if (!horse.ueln) newErrors.ueln = true
        if (!horse.chip) newErrors.chip = true
        if (!horse.owner) newErrors.owner = true
        if (!horse.location) newErrors.location = true
        if (!horse.organisation) newErrors.organisation = true
        if (!horse.issuedDate) newErrors.issuedDate = true
        if (!horse.foodChainStatus) newErrors.foodChainStatus = true

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const encryptPhoto = async ({ photoUri }: { photoUri: string}): Promise<Buffer> => {
        const base64 = await FileSystem.readAsStringAsync(photoUri, { encoding: FileSystem.EncodingType.Base64 })
        const rootKeyHex = await SecureStore.getItemAsync('rootKeyHex') 
        const privateKey = PrivateKey.fromString(rootKeyHex!)
        const publicKey = privateKey.toPublicKey()
        const photoBuffer = Buffer.from(base64, 'base64')
        const encrypted = ECIES.electrumEncrypt(Array.from(photoBuffer), publicKey)
        return Buffer.from(encrypted)
    }

    const uploadPhoto = async ({ photoUri}: { photoUri: string }): Promise<string> =>{
        const encryptedBuffer = await encryptPhoto({ photoUri })
        if (!wallet) throw new Error('Wallet not initialized') 
        const authFetch = new AuthFetch(wallet)

        const response = await authFetch.fetch(`${CERT_SERVER_URL}/upload`, {
            method: 'POST',
            body: encryptedBuffer,
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        })

        const { uhrpurl } = await response.json()
        return uhrpurl
    }

    const handleSave = async () => {
        if (!validate()) return
        
        let uhrpUrl: string | undefined
        if (photoUri) {
            uhrpUrl = await uploadPhoto({ photoUri })
        }

        // Create PushDrop token

        handleOnClose()
    }

    const handleOnClose = () => {
        setHorse({})
        setErrors({})
        onClose()
    }
    
    return (
            <Modal visible={visible} animationType='slide'>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding': 'height'}
                    style={{ flex: 1, backgroundColor: '#f7f2f2' }}
                >
                    <ScrollView>
                        <View style={[styles.headerContainer, { top: insets.top + 26 }]}>
                            <View>
                                <Heading color='#1a1a1a'>Ny häst</Heading>
                            </View>
                            <TouchableOpacity onPress={handleOnClose}>
                                <Ionicons name="close" size={30} color="#1a1a1a" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.container}>
                            <PhotoPicker
                                photoUri={photoUri ?? ''}
                                onPhotoSelected={(uri, source) => {
                                    setPhotoUri(uri)
                                    setPhotoSource(source)
                                }} 
                            
                            />
                            <Section>
                                <SectionHeading fontSize={18}>Häst</SectionHeading>
                                <SectionRowInput
                                    label='Namn'
                                    value={horse.name ?? ''}
                                    onChangeText={(text) => {
                                        setHorse({ ...horse, name: text })
                                        setErrors({ ...errors, name: false })
                                    }}
                                    hasError={errors.name}
                                />
                                <SectionRowInput 
                                    label='Ras'
                                    value={horse.breed ?? ''}
                                    onChangeText={(text) => {
                                        setHorse({ ...horse, breed: text })
                                        setErrors({ ...errors, breed: false })
                                    }}
                                    hasError={errors.breed}
                                />
                                <SectionRowDateInput
                                    label='Född'
                                    value={horse.birthDate ?? ''}
                                    onChangeText={(text) => {
                                        setHorse({ ...horse, birthDate: text })
                                        setErrors({ ...errors, birthDate: false })
                                    }}
                                    hasError={errors.birthDate}
                                />
                                <SectionRowInput 
                                    label='Kön'
                                    value={horse.sex ?? ''}
                                    onChangeText={(text) => {
                                        setHorse({ ...horse, sex: text })
                                        setErrors({ ...errors, sex: false })
                                    }}
                                    hasError={errors.sex}
                                />
                                <SectionRowInput 
                                    label='Färg'
                                    value={horse.color ?? ''}
                                    onChangeText={(text) => {
                                        setHorse({ ...horse, color: text })
                                        setErrors({ ...errors, color: false })
                                    }}
                                    hasError={errors.color}
                                />
                                <SectionRowInput 
                                    label='UELN'
                                    value={horse.ueln ?? ''}
                                    onChangeText={(text) => {
                                        setHorse({ ...horse, ueln: text })
                                        setErrors({ ...errors, ueln: false })
                                    }}
                                    hasError={errors.ueln}
                                />
                                <SectionRowInput 
                                    label='Chip'
                                    value={horse.chip ?? ''}
                                    onChangeText={(text) => {
                                        setHorse({ ...horse, chip: text})
                                        setErrors({ ...errors, chip: false})
                                    }}
                                    hasError={errors.chip}
                                />
                            </Section>
                            <Section>
                                <View style={styles.sectionStyle}>
                                    <SectionHeading fontSize={18}>Ägare</SectionHeading>
                                    <SectionRowInput
                                        label='Ägare'
                                        value={horse.owner ?? ''}
                                        onChangeText={(text) => {
                                            setHorse({ ...horse, owner: text })
                                            setErrors({ ...errors, owner: false })
                                        }}
                                        hasError={errors.owner}    
                                    />
                                    <SectionRowInput 
                                        label='Ort'
                                        value={horse.location ?? ''}
                                        onChangeText={(text) => {
                                            setHorse({ ...horse, location: text })
                                            setErrors({ ...errors, location: false })
                                        }}
                                        hasError={errors.location}
                                    />
                                </View>
                            </Section>
                            <Section>
                                <View style={styles.sectionStyle}>
                                    <SectionHeading fontSize={18}>Utfärdare</SectionHeading>
                                    <SectionRowInput
                                        label='Organisation'
                                        value={horse.organisation ?? ''}
                                        onChangeText={(text) => {
                                            setHorse({ ...horse, organisation: text })
                                            setErrors({ ...errors, organisation: false })
                                        }}
                                        hasError={errors.organisation}    
                                    />
                                    <SectionRowDateInput
                                    label='Utfärdat'
                                    value={horse.issuedDate ?? ''}
                                    onChangeText={(text) => {
                                        setHorse({ ...horse, issuedDate: text })
                                        setErrors({ ...errors, issuedDate: false })
                                    }}
                                    hasError={errors.issuedDate}
                                />
                                </View>
                            </Section>
                            <Section>
                                <View style={styles.sectionStyle}>
                                    <SectionHeading fontSize={18}>Livsmedelskedjan</SectionHeading>
                                    <SectionRowCheckbox 
                                        label='Status'
                                        value={horse.foodChainStatus ?? ''}
                                        onValueChange={(option) => {
                                            setHorse({ ...horse, foodChainStatus: option})
                                        }}
                                    />
                                </View>
                            </Section>
                            <View style={[styles.submitButton, { paddingBottom: insets.bottom }]}>
                                <PrimaryButton onPress={handleSave}>Spara</PrimaryButton>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 15,
        backgroundColor: '#f7f2f2'
    },
    headerContainer: {
        backgroundColor: '#f7f2f2',
        height: 100,
        marginHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    sectionStyle: {
        marginTop: 12
    },
    submitButton: {
        marginTop: 40
    }
})