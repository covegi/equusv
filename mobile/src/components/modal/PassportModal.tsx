import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AntDesign from '@expo/vector-icons/AntDesign'
import * as SecureStore from 'expo-secure-store'
import { v4 as uuid4 } from 'uuid'
import { useWallet } from '@/context/WalletContext'

import Heading from '../text/Heading'
import Section from '../journal/Section'
import SectionHeading from '../journal/SectionHeading'
import SectionRowInput from '../journal/SectionRowInput'
import SectionRowToggle from '../journal/SectionRowToggle'
import type { HorsePassport } from '@/types/horse-passport'
import type { HorsePassportRecord } from '@/types/horse-passport-record'
import PrimaryButton from '../buttons/PrimaryButton'
import SectionRowPicker from '../journal/SectionRowPicker'
import SectionRowDatePicker from '../journal/SectionRowDatePicker'
import { BREEDS } from '../../constants/breeds'
import { SEX } from '../../constants/sex'

export default function PassportModal({ horse, visible, onClose, onSaved }: {horse?: Partial<HorsePassport>, visible: boolean, onClose: () => void, onSaved: (draft: HorsePassportRecord) => void }) {
    const insets = useSafeAreaInsets()
    const [horsePassport, setHorsePassport] = useState<Partial<HorsePassport>>({
        foodChainStatus: false
    })
    const [errors, setErrors] = useState<Partial<Record<keyof HorsePassport, boolean>>>({})
    const { wallet } = useWallet()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (visible && horse) {
            setHorsePassport(horse)
        }
        if (!visible) {
            setHorsePassport({})
        }
    }, [visible])


    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof HorsePassport, boolean>> = {}
        if (!horsePassport.name) newErrors.name = true
        if (!horsePassport.breed) newErrors.breed = true
        if (!horsePassport.birthDate) newErrors.birthDate = true
        if (!horsePassport.sex) newErrors.sex = true
        if (!horsePassport.color) newErrors.color = true
        if (!horsePassport.ownerAtRegistration) newErrors.ownerAtRegistration = true
        if (!horsePassport.location) newErrors.location = true

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const savePassportDraft = async (): Promise<HorsePassportRecord> => {
        const draftId = horsePassport?.id ?? uuid4()
        
        const draft: HorsePassportRecord = {
                horse: {...horsePassport, id: draftId },
                status: 'draft',
                createdAt: new Date().toISOString()
            }

        await SecureStore.setItemAsync(`passport-draft-${draftId}`, JSON.stringify(draft))

        const stored = await SecureStore.getItemAsync('draftIds')
        const ids: string[] = stored ? JSON.parse(stored) : []
        if (!ids.includes(draftId)) {
            ids.push(draftId)
            await SecureStore.setItemAsync('draftIds', JSON.stringify(ids))
        }

        return draft
    }

        const handleSave = async () => {
            console.log('HandleSave triggered')
            setIsLoading(true)
            const isValid = validate()
            console.log('isValid', isValid, 'errors', errors)
            if (!validate()) {
                setIsLoading(false)
                return
            }
            
            try {
                const savedDraft = await savePassportDraft()
                onSaved(savedDraft)
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
                    style={{ flex: 1, backgroundColor: '#F5F0EB' }}
                >
                    {isLoading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator color="#C8963E" size="large" />
                            <Text style={styles.loadingText}>Skapar draft...</Text>
                        </View>
                    )}
                    <ScrollView>
                        <View style={[styles.headerContainer]}>
                            <View style={{ paddingTop: 60 }}>
                                <Heading color='#1b1b1b'>Nytt hästpass</Heading>
                            </View>
                            <TouchableOpacity onPress={handleOnClose}>
                                <AntDesign name="close" size={22} color="#574238" style={{ paddingTop: 62 }}/>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.container}>
                            <Section>
                                <SectionHeading fontSize={11}>HÄST</SectionHeading>
                                <SectionRowInput
                                    label='Namn'
                                    value={horsePassport.name ?? ''}
                                    onChangeText={(text) => {
                                        setHorsePassport({ ...horsePassport, name: text })
                                        setErrors({ ...errors, name: false })
                                    }}
                                    hasError={errors.name}
                                    placeholder='Hästens namnn'
                                    errorMessage='Namn måste anges'
                                />
                                
                                <View style={styles.twoColumnsRow}>
                                    <View style={styles.twoColumnsColumn}>
                                        <SectionRowPicker
                                            label='Ras'
                                            value={horsePassport.breed ?? ''}
                                            selection={BREEDS}
                                            onSelect={(text) => {
                                                setHorsePassport({ ...horsePassport, breed: text })
                                                setErrors({ ...errors, breed: false})
                                            }}
                                            hasError={errors.breed}
                                            placeholder='Välj ras'
                                            errorMessage='Ras måste väljas'
                                        />
                                    </View>
                                    <View style={styles.twoColumnsColumn}>
                                        <SectionRowPicker
                                            label='Kön'
                                            value={horsePassport.sex ?? ''}
                                            selection={SEX}
                                            onSelect={(text) => {
                                                setHorsePassport({ ...horsePassport, sex: text })
                                                setErrors({ ...errors, sex: false})
                                            }}
                                            hasError={errors.sex}
                                            placeholder='Välj kön'
                                            errorMessage='Kön måste väljas'
                                        />
                                    </View>
                                </View>
                                <SectionRowDatePicker 
                                    label='Född'
                                    value={horsePassport.birthDate ?? ''}
                                    onSelect={(text) => {
                                        setHorsePassport({ ...horsePassport, birthDate: text })
                                        setErrors({ ...errors, birthDate: false })
                                    }}
                                    hasError={errors.birthDate}
                                    placeholder='Välj datum'
                                    errorMessage='Datum måste väljas'
                                />
                                <SectionRowInput 
                                    label='Färg'
                                    value={horsePassport.color ?? ''}
                                    onChangeText={(text) => {
                                        setHorsePassport({ ...horsePassport, color: text })
                                        setErrors({ ...errors, color: false })
                                    }}
                                    hasError={errors.color}
                                    placeholder='t.ex. Brun, Svart'
                                    errorMessage='Färg måste anges'
                                />
                            </Section>
                            <Section>
                                <View >
                                    <SectionHeading fontSize={11}>ÄGARE</SectionHeading>
                                    <SectionRowInput
                                        label='Ägare'
                                        value={horsePassport.ownerAtRegistration ?? ''}
                                        onChangeText={(text) => {
                                            setHorsePassport({ ...horsePassport, ownerAtRegistration: text })
                                            setErrors({ ...errors, ownerAtRegistration: false })
                                        }}
                                        hasError={errors.ownerAtRegistration}
                                        placeholder='Ditt namn'
                                        errorMessage='Namn måste anges'    
                                    />
                                    <SectionRowInput 
                                        label='Ort'
                                        value={horsePassport.location ?? ''}
                                        onChangeText={(text) => {
                                            setHorsePassport({ ...horsePassport, location: text })
                                            setErrors({ ...errors, location: false })
                                        }}
                                        hasError={errors.location}
                                        placeholder='t.ex. Flyinge'
                                        errorMessage='Ort måste anges'
                                    />
                                </View>
                            </Section>
                            <Section>
                                <View>
                                    <SectionHeading fontSize={11}>LIVSMEDELSKEDJAN</SectionHeading>
                                    <SectionRowToggle 
                                        label='Ingår i livsmedelskedjan'
                                        value={horsePassport.foodChainStatus!}
                                        onValueChange={(checked: boolean) => {
                                            setHorsePassport({ ...horsePassport, foodChainStatus: checked })
                                        }}
                                    />
                                </View>
                            </Section>
                            <Section>
                                <View style={styles.sectionOverlay}>
                                    <SectionHeading fontSize={13} color='#8a7267'>TILLDELAS AV EXTERN PART</SectionHeading>
                                    <View style={styles.subText}>
                                        <Text style={styles.subTextValue}>Dessa uppgifter fylls i av avelsorganisation, veterinär eller id-kontrollant</Text>
                                    </View>
                                    

                                    <SectionRowInput 
                                    label='UELN'
                                    value={horsePassport.ueln ?? ''}
                                    onChangeText={(text) => {
                                        setHorsePassport({ ...horsePassport, ueln: text })
                                        setErrors({ ...errors, ueln: false })
                                    }}
                                    hasError={errors.ueln}
                                    placeholder='0000000000000'
                                    prefix='SE-'
                                    errorMessage={
                                        !horsePassport.ueln?.trim()
                                        ? 'UELN måste anges'
                                        : 'UELN måste ha 13 siffror'
                                    }
                                    disabled
                                />
                                <SectionRowInput 
                                    label='Chipnr'
                                    value={horsePassport.chip ?? ''}
                                    onChangeText={(text) => {
                                        setHorsePassport({ ...horsePassport, chip: text})
                                        setErrors({ ...errors, chip: false})
                                    }}
                                    hasError={errors.chip}
                                    placeholder='000000000000'
                                    prefix='752'
                                    errorMessage={
                                        !horsePassport.chip?.trim()
                                        ? 'Chipnr måste anges'
                                        : 'Ange 12 sifffor efter 752'
                                    }
                                    disabled
                                />
                                    <SectionRowInput
                                        label='Organisation'
                                        value={horsePassport.organisation ?? ''}
                                        onChangeText={(text) => {
                                            setHorsePassport({ ...horsePassport, organisation: text })
                                            setErrors({ ...errors, organisation: false })
                                        }}
                                        hasError={errors.organisation}
                                        placeholder='Svensk avelsorganisation'
                                        disabled
                                    />
                                </View>
                            </Section>
                           
                            <View style={[styles.submitButton, { paddingBottom: insets.bottom }]}>
                                <PrimaryButton onPress={handleSave}>
                                    {horse?.id ? 'Spara ändringar' : 'Spara utkast'}</PrimaryButton>
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
        backgroundColor: '#F5F0EB',
    },
    headerContainer: {
        backgroundColor: '#F5F0EB',
        height: 96,
        paddingHorizontal: 16,
        marginBottom: 6,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    submitButton: {
        marginHorizontal: 16,
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
    twoColumnsColumn: {
        flex: 1
    },
    twoColumnsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    sectionOverlay: {
        opacity: 0.5
    },
    subText: {
            alignItems: 'center',
            borderBottomWidth: 1.5,
            borderBottomColor: '#E8E0D8',
            paddingBottom: 10,
            marginBottom: 16
    },
    subTextValue: {
        color: '#8a7267',
        fontStyle: 'italic',
        fontSize: 11 
    }
})