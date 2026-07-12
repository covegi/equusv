import '../../polyfills'
import { Stack, useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useFonts, Inter_300Light, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter'
import * as SecureStore from 'expo-secure-store'
import { WalletProvider } from '@/context/WalletContext'
import { RoleProvider } from '@/context/RoleContext'

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
            <WalletProvider>
              <RoleProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen
                    name='home'
                    options={{ headerShown: false }}
                  >
                  </Stack.Screen>
                </Stack>
                </RoleProvider>
            </WalletProvider>
        </GestureHandlerRootView>
    )
}