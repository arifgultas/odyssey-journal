import {
    Caveat_400Regular,
    Caveat_700Bold,
} from '@expo-google-fonts/caveat';
import {
    Ephesis_400Regular,
} from '@expo-google-fonts/ephesis';
import {
    Lora_400Regular,
    Lora_400Regular_Italic,
    Lora_700Bold,
} from '@expo-google-fonts/lora';
import {
    Merriweather_400Regular,
    Merriweather_700Bold,
} from '@expo-google-fonts/merriweather';
import {
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_900Black,
} from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';

export function useBookFonts() {
    const [fontsLoaded, fontError] = useFonts({
        // Playfair Display (Headings)
        'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
        'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
        'PlayfairDisplay-Black': PlayfairDisplay_900Black,

        // Lora (Body text)
        'Lora-Regular': Lora_400Regular,
        'Lora-Bold': Lora_700Bold,
        'Lora-Italic': Lora_400Regular_Italic,

        // Merriweather (Accent)
        'Merriweather-Regular': Merriweather_400Regular,
        'Merriweather-Bold': Merriweather_700Bold,

        // Caveat (Handwriting for polaroid captions)
        'Caveat-Regular': Caveat_400Regular,
        'Caveat-Bold': Caveat_700Bold,

        // Ephesis (Script font for brand title)
        'Ephesis-Regular': Ephesis_400Regular,
    });

    return { fontsLoaded, fontError };
}
