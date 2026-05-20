import { TouchableOpacity } from "react-native"
import AntDesign from '@expo/vector-icons/AntDesign'
import { usePassportModal } from "@/context/PassportModalContext"

export default function PassportHeaderRight() {
    const passportModal = usePassportModal()

    return (
            <TouchableOpacity onPress={
                () => {
                    passportModal.setVisible(true)
                }
            } style={{ paddingRight: 10 }}>
                <AntDesign name='plus' size={24} color='#f7f2f2' /> 
            </TouchableOpacity>
    )
}