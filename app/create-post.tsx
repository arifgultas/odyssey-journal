import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SelectedImage, useImagePicker } from '@/hooks/use-image-picker';
import { useLocationPicker } from '@/hooks/use-location-picker';
import { createPost } from '@/lib/posts';
import { fetchWeatherData, WeatherData } from '@/lib/weather';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Google Stitch Design Colors
const DesignColors = {
    light: {
        background: '#F5F1E8',
        paper: '#ffffff',
        primary: '#D4A574',
        accentBrown: '#8B7355',
        textMain: '#181511',
        textSub: '#887863',
        line: 'rgba(24, 21, 17, 0.1)',
        border: '#e5e1dc',
    },
    dark: {
        background: '#2C1810',
        paper: '#3d261a',
        primary: '#D4A574',
        accentBrown: '#8B7355',
        textMain: '#F5F1E8',
        textSub: '#D4A574',
        line: 'rgba(245, 241, 232, 0.1)',
        border: '#4a3b32',
    },
};

// Category options with custom SVG icons
const CATEGORIES = [
    { id: 'nature', label: 'Doğa', icon: 'tree' },
    { id: 'city', label: 'Şehir', icon: 'city' },
    { id: 'food', label: 'Yemek', icon: 'food' },
    { id: 'history', label: 'Tarih', icon: 'history' },
    { id: 'art', label: 'Sanat', icon: 'art' },
];

// Custom SVG Icons Component
const CategoryIcon = ({ icon, color, size = 20 }: { icon: string; color: string; size?: number }) => {
    switch (icon) {
        case 'tree':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
                    <Path d="M12 3 L15.5 10 H13.5 L17 17 H7 L10.5 10 H8.5 L12 3 Z" strokeLinejoin="round" />
                    <Path d="M12 21 V17" strokeLinecap="round" />
                </Svg>
            );
        case 'city':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
                    <Path d="M3 21h18" strokeLinecap="round" />
                    <Path d="M5 21V10l3-3 3 3v11" strokeLinejoin="round" />
                    <Path d="M13 21V7l3-3 4 3v14" strokeLinejoin="round" />
                    <Rect x={15} y={11} width={2} height={2} fill="none" />
                    <Rect x={15} y={15} width={2} height={2} fill="none" />
                </Svg>
            );
        case 'food':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
                    <Path d="M3 19h18" strokeLinecap="round" />
                    <Path d="M4 19a8 8 0 0 1 16 0" strokeLinejoin="round" />
                    <Path d="M12 11v-4" strokeLinecap="round" />
                    <Circle cx={12} cy={5} r={2} fill="none" />
                </Svg>
            );
        case 'history':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
                    <Rect x={6} y={20} width={12} height={2} strokeLinecap="round" />
                    <Rect x={5} y={4} width={14} height={2} strokeLinecap="round" />
                    <Path d="M7 6v14" strokeLinecap="round" />
                    <Path d="M17 6v14" strokeLinecap="round" />
                    <Line x1={10} y1={6} x2={10} y2={20} strokeDasharray="1 3" strokeLinecap="round" />
                    <Line x1={14} y1={6} x2={14} y2={20} strokeDasharray="1 3" strokeLinecap="round" />
                    <Circle cx={5.5} cy={5} r={1.5} fill="none" />
                    <Circle cx={18.5} cy={5} r={1.5} fill="none" />
                </Svg>
            );
        case 'art':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
                    <Path
                        d="M12 21a9 9 0 0 1-9-9c0-4.97 4.03-9 9-9s9 4.03 9 9c0 1.3-.84 2.4-2.1 2.8-.5.16-1.1-.2-1.1-.76V13a2 2 0 0 0-2-2H9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <Circle cx={10} cy={8} r={1} fill={color} opacity={0.3} />
                    <Circle cx={14} cy={8} r={1} fill={color} opacity={0.3} />
                    <Circle cx={16} cy={12} r={1} fill={color} opacity={0.3} />
                </Svg>
            );
        default:
            return null;
    }
};

// Animated Category Button Component
const AnimatedCategoryButton = ({
    category,
    isSelected,
    onPress,
    theme,
    isDark,
}: {
    category: typeof CATEGORIES[0];
    isSelected: boolean;
    onPress: () => void;
    theme: typeof DesignColors.light;
    isDark: boolean;
}) => {
    const scale = useSharedValue(1);
    const backgroundColor = useSharedValue(isSelected ? 1 : 0);

    useEffect(() => {
        backgroundColor.value = withSpring(isSelected ? 1 : 0, {
            damping: 15,
            stiffness: 150,
        });
    }, [isSelected]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        backgroundColor: interpolate(
            backgroundColor.value,
            [0, 1],
            [0, 1]
        ) === 1 ? theme.primary : 'transparent',
        borderColor: interpolate(
            backgroundColor.value,
            [0, 1],
            [0, 1]
        ) === 1 ? theme.primary : (isDark ? theme.accentBrown : theme.textMain),
    }));

    const handlePressIn = () => {
        scale.value = withSpring(1.05, { damping: 10, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
        >
            <Animated.View style={[styles.categoryButton, animatedStyle]}>
                <CategoryIcon
                    icon={category.icon}
                    color={isSelected ? '#2C1810' : (isDark ? theme.primary : theme.textMain)}
                    size={20}
                />
                <Animated.Text
                    style={[
                        styles.categoryLabel,
                        { color: isSelected ? '#2C1810' : (isDark ? theme.primary : theme.textMain) },
                    ]}
                >
                    {category.label}
                </Animated.Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

// Animated Polaroid Card Component
const AnimatedPolaroidCard = ({
    image,
    index,
    onRemove,
    rotation,
    caption,
    onCaptionChange,
}: {
    image: SelectedImage;
    index: number;
    onRemove: () => void;
    rotation: number;
    caption: string;
    onCaptionChange: (text: string) => void;
}) => {
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);
    const imageScale = useSharedValue(1.1);

    useEffect(() => {
        scale.value = withDelay(
            index * 100,
            withSpring(1, { damping: 12, stiffness: 100 })
        );
        opacity.value = withDelay(
            index * 100,
            withTiming(1, { duration: 400 })
        );
    }, []);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { rotate: `${rotation}deg` },
        ],
        opacity: opacity.value,
    }));

    const animatedImageStyle = useAnimatedStyle(() => ({
        transform: [{ scale: imageScale.value }],
    }));

    return (
        <Animated.View style={[styles.polaroidCard, animatedContainerStyle]} collapsable={false}>
            <TouchableOpacity style={styles.polaroidRemove} onPress={onRemove}>
                <Ionicons name="close" size={14} color="#FFFFFF" />
            </TouchableOpacity>
            <Animated.View style={[styles.polaroidImageContainer, animatedImageStyle]}>
                <Image
                    source={{ uri: image.uri }}
                    style={styles.polaroidImage}
                    contentFit="cover"
                />
            </Animated.View>
            <View style={styles.polaroidCaption} pointerEvents="box-none">
                <TextInput
                    style={styles.polaroidCaptionInput}
                    value={caption}
                    onChangeText={onCaptionChange}
                    placeholder="Not ekle..."
                    placeholderTextColor="#999"
                    maxLength={100}
                    multiline={false}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    underlineColorAndroid="transparent"
                />
            </View>
        </Animated.View>
    );
};

// Animated Location Pin Component
const AnimatedLocationPin = ({ isVisible }: { isVisible: boolean }) => {
    const translateY = useSharedValue(-200);
    const pinScale = useSharedValue(0.8);
    const pinOpacity = useSharedValue(0);
    const shadowOpacity = useSharedValue(0);
    const pulseScale1 = useSharedValue(0.1);
    const pulseOpacity1 = useSharedValue(0.8);
    const pulseScale2 = useSharedValue(0.1);
    const pulseOpacity2 = useSharedValue(0.8);

    useEffect(() => {
        if (isVisible) {
            // Pin drop animation
            translateY.value = withDelay(
                200,
                withSequence(
                    withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }),
                    withTiming(-20, { duration: 150 }),
                    withTiming(0, { duration: 150 }),
                    withTiming(-8, { duration: 100 }),
                    withTiming(0, { duration: 100 })
                )
            );
            pinScale.value = withDelay(
                200,
                withSequence(
                    withTiming(1, { duration: 400 }),
                    withTiming(0.95, { duration: 150 }),
                    withTiming(1, { duration: 300 })
                )
            );
            pinOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
            shadowOpacity.value = withDelay(800, withTiming(1, { duration: 300 }));

            // Pulse animation
            pulseScale1.value = withDelay(
                1000,
                withRepeat(
                    withTiming(2.5, { duration: 3000, easing: Easing.out(Easing.cubic) }),
                    -1,
                    false
                )
            );
            pulseOpacity1.value = withDelay(
                1000,
                withRepeat(
                    withSequence(
                        withTiming(0.4, { duration: 1500 }),
                        withTiming(0, { duration: 1500 })
                    ),
                    -1,
                    false
                )
            );
        } else {
            translateY.value = -200;
            pinOpacity.value = 0;
            shadowOpacity.value = 0;
        }
    }, [isVisible]);

    const pinStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: pinScale.value },
        ],
        opacity: pinOpacity.value,
    }));

    const shadowStyle = useAnimatedStyle(() => ({
        opacity: shadowOpacity.value * 0.4,
    }));

    const pulseStyle1 = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale1.value }],
        opacity: pulseOpacity1.value,
    }));

    if (!isVisible) return null;

    return (
        <View style={styles.locationPinContainer}>
            {/* Pulse rings */}
            <Animated.View style={[styles.pulseRing, pulseStyle1]} />

            {/* Shadow */}
            <Animated.View style={[styles.pinShadow, shadowStyle]} />

            {/* Pin */}
            <Animated.View style={[styles.pinWrapper, pinStyle]}>
                <Ionicons name="location" size={42} color="#D4A574" />
            </Animated.View>
        </View>
    );
};

// Animated Location Card Component
const AnimatedLocationCard = ({
    location,
    theme,
    isDark,
    onConfirm,
    onChangeLocation,
    weatherData,
}: {
    location: { latitude: number; longitude: number; name?: string };
    theme: typeof DesignColors.light;
    isDark: boolean;
    onConfirm: () => void;
    onChangeLocation: () => void;
    weatherData: WeatherData | null;
}) => {
    const cardTranslateY = useSharedValue(40);
    const cardScale = useSharedValue(0.95);
    const cardOpacity = useSharedValue(0);

    useEffect(() => {
        cardTranslateY.value = withDelay(
            1400,
            withSpring(0, { damping: 15, stiffness: 80 })
        );
        cardScale.value = withDelay(
            1400,
            withSpring(1, { damping: 15, stiffness: 80 })
        );
        cardOpacity.value = withDelay(
            1400,
            withTiming(1, { duration: 400 })
        );
    }, []);

    const cardStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: cardTranslateY.value },
            { scale: cardScale.value },
        ],
        opacity: cardOpacity.value,
    }));

    return (
        <Animated.View style={[styles.locationCardOverlay, cardStyle]}>
            <View style={[
                styles.locationConfirmCard,
                {
                    backgroundColor: isDark ? theme.background : theme.paper,
                    borderColor: theme.primary,
                }
            ]}>
                <View style={[
                    styles.locationConfirmInner,
                    { borderColor: `${theme.primary}50` }
                ]}>
                    <View style={styles.locationConfirmHeader}>
                        <Ionicons name="location" size={24} color={theme.primary} />
                        <View style={styles.locationConfirmText}>
                            <Text style={[
                                styles.locationConfirmTitle,
                                { color: isDark ? theme.textMain : '#2C1810' }
                            ]}>
                                {location.name || 'Kapadokya, Türkiye'}
                            </Text>
                            <Text style={[
                                styles.locationConfirmSubtitle,
                                { color: theme.accentBrown }
                            ]}>
                                {`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                            </Text>
                            {weatherData && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                    <Ionicons name={weatherData.icon as any} size={14} color={theme.accentBrown} style={{ marginRight: 4 }} />
                                    <Text style={{ fontFamily: Typography.fonts.ui, fontSize: 12, color: theme.accentBrown }}>
                                        {weatherData.temperature}°C • {weatherData.condition}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={styles.locationConfirmButtons}>
                        <TouchableOpacity
                            style={[styles.locationConfirmButton, { backgroundColor: theme.primary }]}
                            onPress={onConfirm}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.locationConfirmButtonText}>Konumu onayla</Text>
                            <Ionicons name="checkmark" size={16} color="#2C1810" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.locationChangeButton, { borderColor: `${theme.accentBrown}50` }]}
                            onPress={onChangeLocation}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.locationChangeButtonText, { color: theme.accentBrown }]}>
                                Değiştir
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Decorative corner */}
                <View style={[styles.locationCardCorner, { backgroundColor: `${theme.primary}20` }]} />
            </View>
        </Animated.View>
    );
};

// Add Photo Button Component
const AddPhotoButton = ({ onPress, theme }: { onPress: () => void; theme: typeof DesignColors.light }) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 10, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
        >
            <Animated.View style={[
                styles.addPhotoButton,
                { borderColor: `${theme.accentBrown}80` },
                animatedStyle,
            ]}>
                <View style={[styles.addPhotoIconWrapper, { backgroundColor: theme.paper, borderColor: `${theme.accentBrown}30` }]}>
                    <Ionicons name="add-outline" size={24} color={theme.accentBrown} />
                </View>
                <Text style={[styles.addPhotoText, { color: theme.accentBrown }]}>
                    Fotoğraf Ekle
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

export default function CreatePostScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? DesignColors.dark : DesignColors.light;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['nature']); // Default selection
    const [locationConfirmed, setLocationConfirmed] = useState(false);
    const [imageCaptions, setImageCaptions] = useState<string[]>([]);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isFetchingWeather, setIsFetchingWeather] = useState(false);

    const {
        images,
        isLoading: isPickingImage,
        pickMultipleImages,
        takePhoto,
        removeImage,
    } = useImagePicker();

    const {
        location,
        isLoading: isGettingLocation,
        getCurrentLocation,
        clearLocation,
    } = useLocationPicker();

    // Auto-fetch weather when location is selected
    useEffect(() => {
        const fetchWeather = async () => {
            if (location && !weatherData && !isFetchingWeather) {
                setIsFetchingWeather(true);
                try {
                    const weather = await fetchWeatherData(location.latitude, location.longitude);
                    if (weather) {
                        setWeatherData(weather);
                    }
                } catch (error) {
                    console.error('Error fetching weather:', error);
                } finally {
                    setIsFetchingWeather(false);
                }
            }
        };
        fetchWeather();
    }, [location]);

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Hata', 'Lütfen bir başlık girin');
            return;
        }

        if (!content.trim()) {
            Alert.alert('Hata', 'Lütfen hikayenizi yazın');
            return;
        }

        setIsSubmitting(true);
        try {
            await createPost({
                title: title.trim(),
                content: content.trim(),
                location: location || undefined,
                images: images.map((img: SelectedImage) => img.uri),
                imageCaptions: imageCaptions,
                weatherData: weatherData || undefined,
            });

            Alert.alert('Başarılı', 'Günlük girişiniz oluşturuldu!', [
                {
                    text: 'Tamam',
                    onPress: () => router.back(),
                },
            ]);
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert('Hata', 'Gönderi oluşturulamadı. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const showImageOptions = () => {
        Alert.alert('Fotoğraf Ekle', 'Bir seçenek belirleyin', [
            {
                text: 'Fotoğraf Çek',
                onPress: takePhoto,
            },
            {
                text: 'Galeriden Seç',
                onPress: () => pickMultipleImages(5),
            },
            {
                text: 'İptal',
                style: 'cancel',
            },
        ]);
    };

    const formatDate = () => {
        const date = new Date();
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).toUpperCase();
    };

    const getPolaroidRotation = (index: number) => {
        const rotations = [-2.5, 1.5, 3, -1, 2];
        return rotations[index % rotations.length];
    };

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            }
            return [...prev, categoryId];
        });
    };

    const handleLocationConfirm = async () => {
        setLocationConfirmed(true);

        // Fetch weather data for the location
        if (location) {
            setIsFetchingWeather(true);
            try {
                const weather = await fetchWeatherData(location.latitude, location.longitude);
                if (weather) {
                    setWeatherData(weather);
                }
            } catch (error) {
                console.error('Error fetching weather:', error);
            } finally {
                setIsFetchingWeather(false);
            }
        }
    };

    const handleLocationChange = () => {
        clearLocation();
        setLocationConfirmed(false);
        setWeatherData(null);
    };

    const updateCaption = (index: number, text: string) => {
        setImageCaptions(prev => {
            const newCaptions = [...prev];
            newCaptions[index] = text;
            return newCaptions;
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <Animated.View
                    entering={FadeIn.duration(300)}
                    style={[
                        styles.header,
                        {
                            paddingTop: insets.top + Spacing.sm,
                            backgroundColor: isDark ? 'rgba(44, 24, 16, 0.95)' : 'rgba(245, 241, 232, 0.95)',
                            borderBottomColor: theme.border,
                        }
                    ]}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.cancelButton}
                    >
                        <Text style={[styles.cancelText, { color: theme.textSub }]}>
                            İptal
                        </Text>
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, { color: isDark ? theme.primary : '#2C1810' }]}>
                        Yeni Günlük Girişi
                    </Text>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        style={[styles.publishButton, { backgroundColor: theme.primary }]}
                        activeOpacity={0.8}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#2C1810" />
                        ) : (
                            <Text style={styles.publishText}>Paylaş</Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                >
                    {/* Date Stamp */}
                    <Animated.View
                        entering={FadeIn.delay(100).duration(400)}
                        style={styles.dateStampContainer}
                    >
                        <TouchableOpacity
                            style={[
                                styles.dateStamp,
                                { borderColor: theme.accentBrown }
                            ]}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="calendar-outline" size={14} color={theme.accentBrown} style={{ marginRight: 6 }} />
                            <Text style={[styles.dateStampText, { color: theme.textSub }]}>
                                {formatDate()}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Images Section with Vintage Map Background */}
                    <Animated.View
                        entering={FadeIn.delay(200).duration(400)}
                        style={styles.imagesSection}
                    >
                        <View style={[
                            styles.vintageMapBackground,
                            { backgroundColor: isDark ? '#3d261a' : '#e8dcc8' }
                        ]}>
                            {/* Vintage map pattern overlay */}
                            <View style={styles.vintageMapPattern} />
                        </View>

                        <View style={styles.imagesSectionHeader}>
                            <Text style={[styles.sectionLabel, { color: theme.textSub }]}>
                                GÖRSELLER
                            </Text>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.polaroidScrollContainer}
                        >
                            {/* Add Photo Button */}
                            <AddPhotoButton onPress={showImageOptions} theme={theme} />

                            {/* Polaroid Images */}
                            {images.map((image, index) => (
                                <AnimatedPolaroidCard
                                    key={`${image.uri}-${index}`}
                                    image={image}
                                    index={index}
                                    onRemove={() => removeImage(index)}
                                    rotation={getPolaroidRotation(index)}
                                    caption={imageCaptions[index] || ''}
                                    onCaptionChange={(text) => updateCaption(index, text)}
                                />
                            ))}

                            {/* Placeholder cards when empty */}
                            {images.length === 0 && (
                                <>
                                    <View style={[styles.polaroidPlaceholder, { opacity: 0.3 }]}>
                                        <View style={styles.polaroidPlaceholderImage}>
                                            <Ionicons name="image-outline" size={32} color="#999" />
                                        </View>
                                        <View style={styles.polaroidPlaceholderCaption} />
                                    </View>
                                    <View style={[styles.polaroidPlaceholder, { opacity: 0.2, transform: [{ rotate: '3deg' }] }]}>
                                        <View style={styles.polaroidPlaceholderImage}>
                                            <Ionicons name="image-outline" size={32} color="#999" />
                                        </View>
                                        <View style={styles.polaroidPlaceholderCaption} />
                                    </View>
                                </>
                            )}
                        </ScrollView>
                    </Animated.View>

                    {/* Location Section */}
                    <Animated.View
                        entering={FadeIn.delay(300).duration(400)}
                        style={styles.section}
                    >
                        <Text style={[styles.sectionLabel, { color: theme.textSub }]}>
                            LOKASYON
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.locationCard,
                                {
                                    backgroundColor: isDark ? theme.paper : '#FFFFFF',
                                    borderColor: theme.border,
                                }
                            ]}
                            onPress={getCurrentLocation}
                            disabled={isGettingLocation || !!location}
                            activeOpacity={0.9}
                        >
                            {/* Map Background */}
                            <View style={[styles.mapPreview, { backgroundColor: isDark ? '#2a1f18' : '#e8dcc8' }]}>
                                {location ? (
                                    <>
                                        <Image
                                            source={{
                                                uri: `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/${location.longitude},${location.latitude},12,0/400x200?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`
                                            }}
                                            style={styles.mapImage}
                                            contentFit="cover"
                                        />
                                        <View style={styles.mapSepiaOverlay} />
                                    </>
                                ) : (
                                    <View style={styles.mapPlaceholder}>
                                        <Ionicons name="map-outline" size={40} color={theme.textSub} style={{ opacity: 0.5 }} />
                                        {isGettingLocation && (
                                            <ActivityIndicator
                                                size="large"
                                                color={theme.primary}
                                                style={styles.mapLoadingIndicator}
                                            />
                                        )}
                                    </View>
                                )}

                                {/* Animated Location Pin */}
                                <AnimatedLocationPin isVisible={!!location} />

                                {/* Location Confirmation Card */}
                                {location && !locationConfirmed && (
                                    <AnimatedLocationCard
                                        location={location}
                                        theme={theme}
                                        isDark={isDark}
                                        onConfirm={handleLocationConfirm}
                                        onChangeLocation={handleLocationChange}
                                        weatherData={weatherData}
                                    />
                                )}

                                {/* Confirmed indicator with Weather */}
                                {location && locationConfirmed && (
                                    <Animated.View
                                        entering={FadeIn.duration(300)}
                                        style={[
                                            styles.locationConfirmedBadge,
                                            { backgroundColor: theme.primary, flexDirection: 'column', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, height: 'auto', borderRadius: 8 }
                                        ]}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: weatherData ? 4 : 0 }}>
                                            <Ionicons name="checkmark-circle" size={16} color="#2C1810" style={{ marginRight: 6 }} />
                                            <Text style={styles.locationConfirmedText}>Konum seçildi</Text>
                                        </View>

                                        {isFetchingWeather ? (
                                            <ActivityIndicator size="small" color="#2C1810" style={{ marginTop: 2 }} />
                                        ) : weatherData ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                                                <Ionicons name={weatherData.icon as any} size={14} color="#2C1810" style={{ marginRight: 4 }} />
                                                <Text style={{ fontFamily: Typography.fonts.uiBold, fontSize: 12, color: '#2C1810' }}>
                                                    {weatherData.temperature}°C {weatherData.condition}
                                                </Text>
                                            </View>
                                        ) : null}
                                    </Animated.View>
                                )}

                                {/* Pin instruction */}
                                {!location && !isGettingLocation && (
                                    <View style={[styles.pinInstruction, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)' }]}>
                                        <Text style={[styles.pinInstructionText, { color: theme.textSub }]}>
                                            Konum eklemek için dokun
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Categories Section */}
                    <Animated.View
                        entering={FadeIn.delay(400).duration(400)}
                        style={styles.section}
                    >
                        <Text style={[styles.sectionLabel, { color: theme.textSub }]}>
                            KATEGORİLER
                        </Text>

                        <View style={styles.categoriesContainer}>
                            {CATEGORIES.map((category) => (
                                <AnimatedCategoryButton
                                    key={category.id}
                                    category={category}
                                    isSelected={selectedCategories.includes(category.id)}
                                    onPress={() => toggleCategory(category.id)}
                                    theme={theme}
                                    isDark={isDark}
                                />
                            ))}
                        </View>
                    </Animated.View>

                    {/* Gradient Divider */}
                    <Animated.View
                        entering={FadeIn.delay(500).duration(400)}
                        style={styles.gradientDivider}
                    >
                        <View style={[styles.dividerGradient, { backgroundColor: `${theme.accentBrown}30` }]} />
                    </Animated.View>

                    {/* Writing Section */}
                    <Animated.View
                        entering={FadeIn.delay(600).duration(400)}
                        style={styles.writingSection}
                    >
                        {/* Title Input */}
                        <TextInput
                            style={[
                                styles.titleInput,
                                {
                                    color: theme.textMain,
                                    borderBottomColor: `${theme.accentBrown}20`,
                                }
                            ]}
                            placeholder="Başlık"
                            placeholderTextColor={`${theme.accentBrown}40`}
                            value={title}
                            onChangeText={setTitle}
                            maxLength={100}
                        />

                        {/* Content Input with Journal Lines */}
                        <View style={styles.journalContainer}>
                            <TextInput
                                style={[
                                    styles.contentInput,
                                    { color: theme.textMain }
                                ]}
                                placeholder="Hikayeni anlatmaya başla..."
                                placeholderTextColor={`${theme.accentBrown}40`}
                                value={content}
                                onChangeText={setContent}
                                multiline
                                textAlignVertical="top"
                            />
                            {/* Journal lines background */}
                            <View style={styles.journalLines} pointerEvents="none">
                                {[...Array(15)].map((_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.journalLine,
                                            { backgroundColor: isDark ? 'rgba(212, 165, 116, 0.15)' : 'rgba(136, 120, 99, 0.15)' }
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    cancelButton: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
    },
    cancelText: {
        fontFamily: Typography.fonts.ui,
        fontSize: 16,
        fontWeight: '500',
    },
    headerTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    publishButton: {
        paddingHorizontal: Spacing.md + 4,
        paddingVertical: Spacing.xs + 4,
        borderRadius: BorderRadius.full,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    publishText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 14,
        fontWeight: '700',
        color: '#2C1810',
    },

    // Content
    content: {
        flex: 1,
    },

    // Date Stamp
    dateStampContainer: {
        alignItems: 'flex-end',
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
        paddingHorizontal: Spacing.lg,
    },
    dateStamp: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs + 2,
        borderRadius: 4,
    },
    dateStampText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 11,
        letterSpacing: 2,
    },

    // Images Section
    imagesSection: {
        position: 'relative',
        marginTop: Spacing.md,
        paddingVertical: Spacing.lg,
    },
    vintageMapBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    vintageMapPattern: {
        flex: 1,
        opacity: 0.1,
    },
    imagesSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.sm,
    },

    // Section
    section: {
        marginTop: Spacing.lg,
        paddingHorizontal: Spacing.lg,
    },
    sectionLabel: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 11,
        letterSpacing: 2,
        marginBottom: Spacing.sm,
        paddingHorizontal: 4,
        textTransform: 'uppercase',
        opacity: 0.8,
    },

    // Polaroid
    polaroidScrollContainer: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.lg + 8,
        gap: Spacing.lg,
        alignItems: 'center',
    },
    addPhotoButton: {
        width: 140,
        aspectRatio: 4 / 5,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: 'rgba(245, 241, 232, 0.5)',
    },
    addPhotoIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    addPhotoText: {
        fontFamily: Typography.fonts.ui,
        fontSize: 12,
        fontWeight: '500',
    },
    polaroidCard: {
        width: 160,
        backgroundColor: '#FFFFFF',
        padding: 12,
        paddingBottom: 32,
        borderRadius: 2,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 2, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    polaroidRemove: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        backgroundColor: '#2C1810',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
    polaroidImageContainer: {
        aspectRatio: 1,
        backgroundColor: '#F3F4F6',
        overflow: 'hidden',
        marginBottom: 12,
    },
    polaroidImage: {
        width: '100%',
        height: '100%',
    },
    polaroidCaption: {
        alignItems: 'center',
    },
    polaroidCaptionText: {
        fontFamily: Typography.fonts.bodyItalic,
        fontSize: 12,
        color: '#6B7280',
    },
    polaroidCaptionInput: {
        fontFamily: Typography.fonts.bodyItalic,
        fontSize: 12,
        color: '#4B5563',
        textAlign: 'center',
        width: '100%',
        paddingVertical: 6,
        paddingHorizontal: 10,
        minHeight: 28,
        backgroundColor: '#FAFAFA',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 4,
    },
    polaroidPlaceholder: {
        width: 140,
        backgroundColor: '#FFFFFF',
        padding: 12,
        paddingBottom: 32,
        borderRadius: 2,
        transform: [{ rotate: '-2.5deg' }],
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 2, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    polaroidPlaceholderImage: {
        aspectRatio: 1,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    polaroidPlaceholderCaption: {
        width: 60,
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        alignSelf: 'center',
    },

    // Location
    locationCard: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    mapPreview: {
        height: 200,
        position: 'relative',
        overflow: 'hidden',
    },
    mapImage: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    mapSepiaOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(112, 66, 20, 0.2)',
    },
    mapPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapLoadingIndicator: {
        position: 'absolute',
    },

    // Location Pin Animation
    locationPinContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -24,
        marginTop: -48,
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: 48,
        height: 48,
    },
    pulseRing: {
        position: 'absolute',
        bottom: 2,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(212, 165, 116, 0.4)',
    },
    pinShadow: {
        position: 'absolute',
        bottom: -4,
        width: 16,
        height: 6,
        borderRadius: 8,
        backgroundColor: '#2C1810',
    },
    pinWrapper: {
        zIndex: 10,
    },

    // Location Confirmation Card
    locationCardOverlay: {
        position: 'absolute',
        bottom: Spacing.md,
        left: Spacing.md,
        right: Spacing.md,
    },
    locationConfirmCard: {
        borderRadius: BorderRadius.lg,
        borderWidth: 2,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    locationConfirmInner: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: BorderRadius.lg - 2,
        padding: Spacing.md,
        margin: 2,
    },
    locationConfirmHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
    },
    locationConfirmText: {
        flex: 1,
    },
    locationConfirmTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 24,
    },
    locationConfirmSubtitle: {
        fontFamily: Typography.fonts.bodyItalic,
        fontSize: 11,
        marginTop: 4,
    },
    locationConfirmButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    locationConfirmButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    locationConfirmButtonText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 12,
        fontWeight: '700',
        color: '#2C1810',
    },
    locationChangeButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    locationChangeButtonText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 12,
        fontWeight: '700',
    },
    locationCardCorner: {
        position: 'absolute',
        top: -16,
        right: -16,
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    locationConfirmedBadge: {
        position: 'absolute',
        bottom: Spacing.sm,
        right: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    locationConfirmedText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 10,
        fontWeight: '600',
        color: '#2C1810',
    },
    pinInstruction: {
        position: 'absolute',
        bottom: Spacing.sm,
        right: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: 4,
    },
    pinInstructionText: {
        fontFamily: Typography.fonts.ui,
        fontSize: 10,
        fontWeight: '500',
    },

    // Categories
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        paddingHorizontal: 4,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
    },
    categoryLabel: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 14,
        fontWeight: '600',
    },

    // Gradient Divider
    gradientDivider: {
        marginTop: Spacing.xl,
        marginBottom: Spacing.lg,
        marginHorizontal: Spacing.lg,
        height: 1,
        alignItems: 'center',
    },
    dividerGradient: {
        width: '100%',
        height: 1,
    },

    // Writing Section
    writingSection: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.lg,
    },

    // Title Input
    titleInput: {
        fontFamily: Typography.fonts.heading,
        fontSize: 30,
        fontWeight: '700',
        letterSpacing: -0.5,
        padding: 0,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
    },

    // Content Input
    journalContainer: {
        position: 'relative',
        minHeight: 350,
    },
    contentInput: {
        fontFamily: Typography.fonts.body,
        fontSize: 18,
        lineHeight: 32,
        padding: 0,
        textAlignVertical: 'top',
        zIndex: 1,
    },
    journalLines: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
    journalLine: {
        height: 1,
        marginTop: 31,
    },
});
