import { useWindowDimensions, Platform, ViewStyle } from 'react-native';

export interface ResponsiveLayout {
    isTablet: boolean;
    isWeb: boolean;
    isLargeScreen: boolean;
    contentContainerStyle: ViewStyle;
    gridColumns: number;
}

/**
 * Hook to provide screen responsiveness measurements and styles.
 * Ideal for scaling layouts on Tablets and Web browsers.
 */
export function useResponsive(): ResponsiveLayout {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const isWeb = Platform.OS === 'web';
    const isLargeScreen = isTablet || isWeb;

    // Center content on wide screens and restrict width to maintain book aesthetics
    const contentContainerStyle: ViewStyle = isLargeScreen 
        ? { 
            maxWidth: 640, 
            width: '100%', 
            alignSelf: 'center',
            backgroundColor: 'transparent',
          } 
        : { 
            width: '100%' 
          };

    // Calculate grid columns for explore/profile page photos
    const gridColumns = width >= 1024 ? 4 : width >= 768 ? 3 : 2;

    return {
        isTablet,
        isWeb,
        isLargeScreen,
        contentContainerStyle,
        gridColumns,
    };
}
