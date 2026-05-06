import '../../polyfills'
import { Stack, useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { useFonts, Inter_300Light, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter'
import * as SecureStore from 'expo-secure-store'
import { WalletProvider } from '@/context/WalletContext'
import { PassportModalProvider } from '@/context/PassportModalContext'
import PassportHeaderRight from '@/components/passport/PassportHeaderRight'


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
      <WalletProvider>
        <PassportModalProvider>
         <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name='passport'
            options={{ 
              headerShown: true,
              title: 'Hästpass',
              headerStyle: { backgroundColor: '#1a1a1a'},
              headerTintColor: '#f7f2f2',
              headerBackTitle: 'Tillbaka',
              headerRight: () => <PassportHeaderRight />
            }} />
         </Stack>
         </PassportModalProvider>
      </WalletProvider>
    )
}