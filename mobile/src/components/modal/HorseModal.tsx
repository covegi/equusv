import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as SecureStore from 'expo-secure-store'
import { AuthFetch, PrivateKey, ECIES } from '@bsv/sdk'
import { useWallet } from '@/context/WalletContext'

import Heading from '../text/Heading'
import Section from '../journal/Section'
import SectionHeading from '../journal/SectionHeading'
import SectionRowInput from '../journal/SectionRowInput'
import SectionRowDateInput from '../journal/SectionRowDateInput'
import SectionRowCheckbox from '../journal/SectionRowCheckbox'
import type { HorsePassport } from '@/types/horse-passport'
import type { HorsePassportDraft } from '@/types/horse-passport-draft'
import PrimaryButton from '../buttons/PrimaryButton'

export default function HorseModal({ visible, onClose, onSaved }: {visible: boolean, onClose: () => void, onSaved: () => void }) {
    const insets = useSafeAreaInsets()
    const [horsePassport, setHorsePassport] = useState<Partial<HorsePassport>>({})
    const [errors, setErrors] = useState<Partial<Record<keyof HorsePassport, boolean>>>({})
    const { wallet } = useWallet()
    const [isLoading, setIsLoading] = useState(false)

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

    // const createToken = async ({ horse }: { horse: HorsePassport }): Promise<void> =>{
    //     if (!wallet) throw new Error('Wallet not initialized') 
    //     const authFetch = new AuthFetch(wallet)
        
    //     const identityKey = wallet.identityKey

    //     const response = await authFetch.fetch(`${TOKEN_SERVER_URL}/identity/passport/create`, {
    //         method: 'POST',
    //         body: JSON.stringify({ horse, identityKey }),
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     })

    //     const { tx: txBase64, txid, outputIndex } = await response.json()
    //     const tx = Array.from(Buffer.from(txBase64, 'base64'))

    //     await wallet.internalizeAction({
    //         tx,
    //         outputs: [{
    //             outputIndex: outputIndex,
    //             protocol: 'basket insertion',
    //             insertionRemittance: {
    //                 basket: `equusv-${horse.ueln}`,
    //                 customInstructions: JSON.stringify({ type: 'horse-passport'}),
    //                 tags: ['passport']
    //             }
    //         }],
    //         description: 'Internalize horse passport'
    //     })

    //     const stored = await SecureStore.getItemAsync('horseUelns')
    //     const uelns: string[] = stored ? JSON.parse(stored) : []
    //     if (!uelns.includes(horse.ueln)) {
    //         uelns.push(horse.ueln)
    //         await SecureStore.setItemAsync('horseUelns', JSON.stringify(uelns))
    //     }

    //     await SecureStore.setItemAsync(`passportTxid-${horse.ueln}`, txid)
    // }

    const savePassportDraft = async (): Promise<HorsePassportDraft> => {
        if (!wallet) throw new Error('Wallet not initialized.')

        const authFetch = new AuthFetch(wallet)
        
        const createPassportDraft = () => {
            const draft = {
                horse: horsePassport,
                status: 'draft',
                createdAt: new Date().toISOString()
            }

            return draft
        }

        const draft = createPassportDraft()

        const savePassportDraftToSecureStore = async ({ draft }: { draft: HorsePassportDraft}) => {
            await SecureStore.setItemAsync(`passport-draft-${draft.horse.ueln}`, JSON.stringify(draft))
        }

        await savePassportDraftToSecureStore({ draft: draft as HorsePassportDraft })

        const rootKeyHex = await SecureStore.getItemAsync('rootKeyHex')
        const privateKey = PrivateKey.fromString(rootKeyHex!)
        const publicKey = privateKey.toPublicKey()
        const draftBuffer = Buffer.from(JSON.stringify(draft), 'utf-8')
        const encryptedData = ECIES.electrumEncrypt(Array.from(draftBuffer), publicKey)

        const response = await authFetch.fetch(`${TOKEN_SERVER_URL}/draft`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                tokenType: 'identity/passport',
                encryptedData: Buffer.from(encryptedData).toString('base64'),
                identityKey: wallet.identityKey,
                status: 'draft',
                ueln: draft.horse.ueln
            })
        })

        return draft as HorsePassportDraft
    }

        const handleSave = async () => {
            setIsLoading(true)
            if (!validate()) {
                setIsLoading(false)
                return
            }
            
            try {
                await savePassportDraft()
                onSaved()
                handleOnClose()
                setIsLoading(false)
            } catch (error) {
                console.error('handleSave error:', error)
                setIsLoading(false)
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
                    {isLoading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator color="#C8963E" size="large" />
                            <Text style={styles.loadingText}>Skapar pass...</Text>
                        </View>
                    )}
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
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        zIndex: 10
    },
    loadingText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: '#f7f2f2'
    },
})