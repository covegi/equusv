import { StyleSheet, View, Text } from "react-native"
import type { HorsePassport } from "@/types/horse-passport"

export default function HorseJournal({ horse, horseImage, onClose }: { horse: HorsePassport | null, horseImage: string, onClose: () => void }) {

     return (
         <View>
               <Text>Horse Journal</Text>
         </View>
     )
}