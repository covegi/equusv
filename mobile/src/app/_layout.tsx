import '../../polyfills'
import { Stack, useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useFonts, Inter_300Light, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter'
import * as SecureStore from 'expo-secure-store'
import { WalletProvider } from '@/context/WalletContext'
import { PassportModalProvider } from '@/context/PassportModalContext'
import { ActivitiesMenuContextProvider } from '@/context/ActivitiesMenuContext'
import PassportHeaderRight from '@/components/passport/PassportHeaderRight'
import HamburgerHeaderLeft from '@/components/navigation/HamburgerHeaderLeft'
import ActivitiesMenu from '@/components/menu/ActivitiesMenu'

const hamburgerHeaaderLeft = () => <HamburgerHeaderLeft />
const passportHeaderRight = () => <PassportHeaderRight />

export default function RootLayout() {
  const [fontsLoaded] = useFonts({Inter_300Light, Inter_400Regular, Inter_600SemiBold})
  const [checked, setChecked] = useState(false)

  const router = useRouter()

  useEffect(() => {
    if (!fontsLoaded) return
    const checkKey = async () => {
      const key = await SecureStore.getItemAsync('rootKeyHex')
      if (key) {
        router.replace('/login')
      }
      setChecked(true)
    }
    checkKey()
  }, [fontsLoaded])

  if (!fontsLoaded || !checked) return null

  return  (
      <GestureHandlerRootView style={{ flex: 1 }}>
         <ActivitiesMenuContextProvider>
            <WalletProvider>
              <PassportModalProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen
                    name='horses'
                    options={{
                      headerShown: true,
                      title:'Mina hästar',
                      headerTitleStyle: { fontSize: 22},
                      headerStyle: { backgroundColor: '#F5F0EB'},
                      headerTintColor: '#1b1b1b',
                      headerBackVisible: false,
                      headerShadowVisible: false,
                      headerLeft: hamburgerHeaaderLeft,
                    }}
                  >
                  </Stack.Screen>
                  <Stack.Screen
                    name='passport'
                    options={{ 
                      headerShown: true,
                      title: 'Hästpass',
                      headerStyle: { backgroundColor: '#1a1a1a'},
                      contentStyle: { paddingTop: 10, backgroundColor: '#1a1a1a' },
                      headerTintColor: '#f7f2f2',
                      headerBackVisible: false,
                      gestureEnabled: false,
                      headerLeft: hamburgerHeaaderLeft,
                      headerRight: passportHeaderRight
                    }} />
                </Stack>
                <ActivitiesMenu />
              </PassportModalProvider>
            </WalletProvider>
          </ActivitiesMenuContextProvider>
        </GestureHandlerRootView>
    )
}