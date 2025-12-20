import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Onboarding data
const onboardingData = [
    {
        id: 1,
        image: require('@/assets/images/onboarding-cappadocia.png'),
        title: 'Keşfetmeye\nBaşla',
        description: 'Dünyanın en büyüleyici rotalarını keşfedin, seyahat ipuçları edinin ve unutulmaz anılarınızı paylaşın.',
    },
    {
        id: 2,
        image: require('@/assets/images/onboarding-sharing.png'),
        title: 'Anılarını\nPaylaş',
        description: 'Seyahatlerinizden fotoğraflar ve hikayeler paylaşın. Diğer gezginlerle bağlantı kurun.',
    },
    {
        id: 3,
        image: require('@/assets/images/onboarding-community.png'),
        title: 'İlham Al\nve İlham Ver',
        description: 'Topluluğumuzdan ilham alın ve kendi maceralarınızla başkalarına ilham verin.',
    },
];

export default function OnboardingScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [currentIndex, setCurrentIndex] = useState(0);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const imageScale = useRef(new Animated.Value(1.1)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Initial animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(imageScale, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [currentIndex]);

    const navigateToAuth = () => {
        router.replace('/(auth)/login');
    };

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            // Reset animations for next slide
            fadeAnim.setValue(0);
            slideAnim.setValue(30);
            imageScale.setValue(1.1);

            setCurrentIndex(currentIndex + 1);
        } else {
            // Navigate to auth or main app
            navigateToAuth();
        }
    };

    const handleSkip = () => {
        navigateToAuth();
    };

    const handleButtonPressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handleButtonPressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const currentData = onboardingData[currentIndex];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'light-content'}
                translucent
                backgroundColor="transparent"
            />

            {/* Hero Image Section */}
            <Animated.View
                style={[
                    styles.imageContainer,
                    { transform: [{ scale: imageScale }] },
                ]}
            >
                <Image
                    source={currentData.image}
                    style={styles.heroImage}
                    contentFit="cover"
                    transition={300}
                />

                {/* Top gradient overlay */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'transparent']}
                    style={styles.topGradient}
                />

                {/* Bottom gradient overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)']}
                    style={styles.bottomGradientOverlay}
                />
            </Animated.View>

            {/* Skip Button */}
            <View style={[styles.skipButtonContainer, { top: insets.top + 16 }]}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Pressable
                        style={styles.skipButton}
                        onPress={handleSkip}
                    >
                        <Text style={styles.skipButtonText}>Atla</Text>
                    </Pressable>
                </Animated.View>
            </View>

            {/* Curved content section */}
            <View
                style={[
                    styles.contentSection,
                    { backgroundColor: theme.background },
                ]}
            >
                <View style={styles.contentInner}>
                    {/* Title */}
                    <Animated.View
                        style={[
                            styles.titleContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.title,
                                {
                                    color: isDark
                                        ? '#F4C025' // Gold for dark mode (matching Stitch design)
                                        : theme.primary,
                                },
                            ]}
                        >
                            {currentData.title}
                        </Text>
                    </Animated.View>

                    {/* Description */}
                    <Animated.View
                        style={[
                            styles.descriptionContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.description,
                                {
                                    color: isDark
                                        ? 'rgba(255,255,255,0.7)'
                                        : theme.textSecondary,
                                },
                            ]}
                        >
                            {currentData.description}
                        </Text>
                    </Animated.View>
                </View>

                {/* Bottom Section */}
                <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
                    {/* Page Indicators */}
                    <View style={styles.indicatorContainer}>
                        {onboardingData.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.indicator,
                                    index === currentIndex
                                        ? [
                                            styles.indicatorActive,
                                            {
                                                backgroundColor: isDark
                                                    ? '#F4C025'
                                                    : theme.primary,
                                            },
                                        ]
                                        : {
                                            backgroundColor: isDark
                                                ? 'rgba(255,255,255,0.2)'
                                                : 'rgba(44,24,16,0.2)',
                                        },
                                ]}
                            />
                        ))}
                    </View>

                    {/* Next Button */}
                    <Animated.View
                        style={[
                            styles.buttonContainer,
                            {
                                transform: [{ scale: buttonScale }],
                            },
                        ]}
                    >
                        <Pressable
                            style={[
                                styles.nextButton,
                                {
                                    backgroundColor: isDark
                                        ? '#F4C025'
                                        : theme.primary,
                                },
                            ]}
                            onPress={handleNext}
                            onPressIn={handleButtonPressIn}
                            onPressOut={handleButtonPressOut}
                        >
                            <Text
                                style={[
                                    styles.nextButtonText,
                                    {
                                        color: isDark
                                            ? '#2E291E'
                                            : theme.surface,
                                    },
                                ]}
                            >
                                {currentIndex === onboardingData.length - 1
                                    ? 'Başla'
                                    : 'İleri'}
                            </Text>
                            <Ionicons
                                name="arrow-forward"
                                size={20}
                                color={isDark ? '#2E291E' : theme.surface}
                                style={styles.nextButtonIcon}
                            />
                        </Pressable>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.6,
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    bottomGradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        opacity: 0.6,
    },
    skipButtonContainer: {
        position: 'absolute',
        right: 20,
        zIndex: 30,
    },
    skipButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 50,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    skipButtonText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    contentSection: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.48,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 40,
        elevation: 10,
    },
    contentInner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: Spacing.md,
    },
    titleContainer: {
        marginBottom: Spacing.lg,
    },
    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: 42,
        lineHeight: 50,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    descriptionContainer: {
        maxWidth: 320,
    },
    description: {
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        lineHeight: 26,
        textAlign: 'center',
    },
    bottomSection: {
        alignItems: 'center',
        gap: 28,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    indicator: {
        height: 8,
        width: 8,
        borderRadius: 4,
    },
    indicatorActive: {
        width: 32,
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 320,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 18,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    nextButtonText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 18,
        letterSpacing: 0.5,
    },
    nextButtonIcon: {
        marginLeft: 4,
    },
});
