import { Pressable } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign'
import { useRouter } from 'expo-router'
import { useActivitesMenu } from '@/context/ActivitiesMenuContext'

export default function HamburgerHeaderLeft() {
    const router = useRouter()
    const { setMenuVisible } = useActivitesMenu()

    return (
            <Pressable onPress={
                () => {
                    console.log('hamburger pressed, setMenuVisible(true)')
                    setMenuVisible(true)
                }
            } style={{ paddingLeft: 10 }}>
                <AntDesign name="menu" size={24} color="#f7f2f2" />
            </Pressable>
    )
}