import { useTheme } from '@/context/theme-context';
import { ColorSchemeName } from 'react-native';

export function useColorScheme(): ColorSchemeName {
    const { colorScheme } = useTheme();
    return colorScheme;
}
