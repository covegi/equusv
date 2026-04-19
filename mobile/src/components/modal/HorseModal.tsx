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
import type { HorsePassport } from '@/types/horse-passport'
import PrimaryButton from '../buttons/PrimaryButton'

export default function HorseModal({ visible, onClose, onSaved }: {visible: boolean, onClose: () => void, onSaved: () => void }) {
    const insets = useSafeAreaInsets()
    const [horsePassport, setHorsePassport] = useState<Partial<HorsePassport>>({})
    const [errors, setErrors] = useState<Partial<Record<keyof HorsePassport, boolean>>>({})
    const [photoUri, setPhotoUri] = useState<string | null>(null)
    const [photoSource, setPhotoSource] = useState<'camera' | 'gallery' | null>(null)
    const { wallet } = useWallet()

    const TOKEN_SERVER_URL = process.env.EXPO_PUBLIC_TOKEN_SERVER_URL

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof HorsePassport, boolean>> = {}
        if (!horsePassport.name) newErrors.name = true
        if (!horsePassport.breed) newErrors.breed = true
        if (!horsePassport.birthDate) newErrors.birthDate = true
        if (!horsePassport.sex) newErrors.sex = true
        if (!horsePassport.color) newErrors.color = true
        if (!horsePassport.ueln) newErrors.ueln = true
        if (!horsePassport.chip) newErrors.chip = true
        if (!horsePassport.ownerAtRegistration) newErrors.ownerAtRegistration = true
        if (!horsePassport.location) newErrors.location = true
        if (!horsePassport.organisation) newErrors.organisation = true
        if (!horsePassport.issuedDate) newErrors.issuedDate = true
        if (!horsePassport.foodChainStatus) newErrors.foodChainStatus = true

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

    const createToken = async ({ photoUri, horse }: { photoUri: string | null, horse: HorsePassport }): Promise<void> =>{
        let base64body
        if (photoUri) {
            const encryptedBuffer = await encryptPhoto({ photoUri })
            base64body = encryptedBuffer.toString('base64')
        }
        if (!wallet) throw new Error('Wallet not initialized') 
        const authFetch = new AuthFetch(wallet)
        
        const identityKey = wallet.identityKey

        const response = await authFetch.fetch(`${TOKEN_SERVER_URL}/identity/passport/create`, {
            method: 'POST',
            body: JSON.stringify({ base64body, horse, identityKey }),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const { tx: txBase64, txid, outputIndex } = await response.json()
        const tx = Array.from(Buffer.from(txBase64, 'base64'))

        await wallet.internalizeAction({
            tx,
            outputs: [{
                outputIndex: outputIndex,
                protocol: 'basket insertion',
                insertionRemittance: {
                    basket: `equusv-${horse.ueln}`,
                    customInstructions: JSON.stringify({ type: 'horse-passport'}),
                    tags: ['passport']
                }
            }],
            description: 'Internalize horse passport'
        })

        const stored = await SecureStore.getItemAsync('horseUelns')
        const uelns: string[] = stored ? JSON.parse(stored) : []
        if (!uelns.includes(horse.ueln)) {
            uelns.push(horse.ueln)
            await SecureStore.setItemAsync('horseUelns', JSON.stringify(uelns))
        }

        await SecureStore.setItemAsync(`passportTxid-${horse.ueln}`, txid)
    }

        const handleSave = async () => {
            if (!validate()) return
            
            try {
                await createToken({ photoUri, horse: horsePassport as HorsePassport })
                onSaved()
                handleOnClose()
            } catch (error) {
                console.error('handleSave error:', error)
            }
        }

    const handleOnClose = () => {
        setHorsePassport({})
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
                                    value={horsePassport.name ?? ''}
                                    onChangeText={(text) => {
                                        setHorsePassport({ ...horsePassport, name: text })
                                        setErrors({ ...errors, name: false })
                                    }}
                                    hasError={errors.name}
                                />
                                <SectionRowInput 
                                    label='Ras'
                                    value={horsePassport.breed ?? ''}
                                    onChangeText={(text) => {
                                        setHorsePassport({ ...horsePassport, breed: text })
                                        setErrors({ ...errors, breed: false })
                                    }}
                                    hasError={errors.breed}
                                />
                                <SectionRowDateInput
                                    label='Född'
                                    value={horsePassport.birthDate ?? ''}
                                    onChangeText={(text) => {
                                        setHorsePassport({ ...horsePassport, birthDate: text })
                                        setErrors({ ...errors, birthDate: false })
                                    }}
                                    hasError={errors.birthDate}
                                />
                                <SectionRowInput 
                                    label='Kön'
                                    value={horsePassport.sex ?? ''}
                                    onChangeText={(text) => {
                                        setHorsePassport({ ...horsePassport, sex: text })
                                        setErrors({ ...errors, sex: false })
                                    }}
                                    hasError={errors.sex}
                                />
                                <SectionRowInput 
                                    label='Färg'
                                    value={horsePassport.color ?? ''}
                                    onChangeText={(text) => {
                                        setHorsePassport({ ...horsePassport, color: text })
                                        setErrors({ ...errors, color: false })
                                    }}
                                    hasError={errors.color}
                                />
                                <SectionRowInput 
                                    label='UELN'
                                    value={horsePassport.ueln ?? ''}
                                    onChangeText={(text) => {
                                        setHorsePassport({ ...horsePassport, ueln: text })
                                        setErrors({ ...errors, ueln: false })
                                    }}
                                    hasError={errors.ueln}
                                />
                                <SectionRowInput 
                                    label='Chip'
                                    value={horsePassport.chip ?? ''}
                                    onChangeText={(text) => {
                                        setHorsePassport({ ...horsePassport, chip: text})
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
                                        value={horsePassport.ownerAtRegistration ?? ''}
                                        onChangeText={(text) => {
                                            setHorsePassport({ ...horsePassport, ownerAtRegistration: text })
                                            setErrors({ ...errors, ownerAtRegistration: false })
                                        }}
                                        hasError={errors.ownerAtRegistration}    
                                    />
                                    <SectionRowInput 
                                        label='Ort'
                                        value={horsePassport.location ?? ''}
                                        onChangeText={(text) => {
                                            setHorsePassport({ ...horsePassport, location: text })
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
                                        value={horsePassport.organisation ?? ''}
                                        onChangeText={(text) => {
                                            setHorsePassport({ ...horsePassport, organisation: text })
                                            setErrors({ ...errors, organisation: false })
                                        }}
                                        hasError={errors.organisation}    
                                    />
                                    <SectionRowDateInput
                                    label='Utfärdat'
                                    value={horsePassport.issuedDate ?? ''}
                                    onChangeText={(text) => {
                                        setHorsePassport({ ...horsePassport, issuedDate: text })
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
                                        value={horsePassport.foodChainStatus ? 'Ingår' : 'Ingår ej'}
                                        onValueChange={(option) => {
                                            setHorsePassport({ ...horsePassport, foodChainStatus: option === 'Ingår'})
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