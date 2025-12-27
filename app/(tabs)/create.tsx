import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SelectedImage, useImagePicker } from '@/hooks/use-image-picker';
import { useLocationPicker } from '@/hooks/use-location-picker';
import { createPost } from '@/lib/posts';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

// Mood options
const MOODS = [
    { id: 'adventure', icon: 'terrain', label: 'Macera' },
    { id: 'peaceful', icon: 'spa', label: 'Huzur' },
    { id: 'discovery', icon: 'explore', label: 'Keşif' },
    { id: 'romantic', icon: 'favorite', label: 'Romantik' },
];

// Template options
const TEMPLATES = [
    { id: 'classic', label: 'Klasik Günlük' },
    { id: 'photo', label: 'Fotoğraf Odaklı' },
    { id: 'minimal', label: 'Minimalist Rota' },
    { id: 'food', label: 'Yemek Tadımı' },
];

export default function CreatePostScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? DesignColors.dark : DesignColors.light;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const {
        images,
        isLoading: isPickingImage,
        pickMultipleImages,
        takePhoto,
        removeImage,
        clearImages,
    } = useImagePicker();

    const {
        location,
        isLoading: isGettingLocation,
        getCurrentLocation,
        clearLocation,
        getLocationString,
    } = useLocationPicker();

    const resetForm = () => {
        setTitle('');
        setContent('');
        setSelectedMood(null);
        setSelectedTemplate(null);
        clearLocation();
        if (clearImages) clearImages();
    };

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
            });

            Alert.alert('Başarılı', 'Günlük girişiniz oluşturuldu!', [
                {
                    text: 'Tamam',
                    onPress: () => {
                        resetForm();
                        router.push('/(tabs)');
                    },
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
        const rotations = [-1.5, 1.5, -0.5, 2, -2];
        return rotations[index % rotations.length];
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={[
                    styles.header,
                    {
                        paddingTop: insets.top + Spacing.sm,
                        backgroundColor: isDark ? 'rgba(44, 24, 16, 0.95)' : 'rgba(245, 241, 232, 0.95)',
                        borderBottomColor: theme.border,
                    }
                ]}>
                    <View style={styles.headerSpacer} />

                    <Text style={[styles.headerTitle, { color: theme.textMain }]}>
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
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                >
                    {/* Date Stamp */}
                    <View style={styles.dateStampContainer}>
                        <View style={[styles.dateStamp, { borderColor: `${theme.accentBrown}40` }]}>
                            <Text style={[styles.dateStampText, { color: theme.textSub }]}>
                                {formatDate()}
                            </Text>
                        </View>
                    </View>

                    {/* Images Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: theme.textSub }]}>
                            GÖRSELLER
                        </Text>

                        {/* Upload Area */}
                        <TouchableOpacity
                            style={[
                                styles.uploadArea,
                                {
                                    borderColor: theme.accentBrown,
                                    backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.3)',
                                }
                            ]}
                            onPress={showImageOptions}
                            disabled={isPickingImage || images.length >= 5}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.uploadIcon, { backgroundColor: `${theme.accentBrown}15` }]}>
                                {isPickingImage ? (
                                    <ActivityIndicator size="small" color={theme.accentBrown} />
                                ) : (
                                    <Ionicons name="camera" size={36} color={theme.accentBrown} />
                                )}
                            </View>
                            <Text style={[styles.uploadText, { color: theme.accentBrown }]}>
                                Görselleri buraya sürükle veya seçmek için dokun
                            </Text>
                        </TouchableOpacity>

                        {/* Polaroid Images */}
                        {images.length > 0 && (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.polaroidContainer}
                            >
                                {images.map((image, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.polaroidCard,
                                            { transform: [{ rotate: `${getPolaroidRotation(index)}deg` }] }
                                        ]}
                                    >
                                        <TouchableOpacity
                                            style={styles.polaroidRemove}
                                            onPress={() => removeImage(index)}
                                        >
                                            <Ionicons name="close" size={16} color="#FFFFFF" />
                                        </TouchableOpacity>
                                        <View style={styles.polaroidImageContainer}>
                                            <Image
                                                source={{ uri: image.uri }}
                                                style={styles.polaroidImage}
                                                contentFit="cover"
                                            />
                                        </View>
                                        <View style={styles.polaroidCaption}>
                                            <Text style={styles.polaroidCaptionText}>
                                                Anı {index + 1}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    {/* Location Section */}
                    <View style={styles.section}>
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
                            disabled={isGettingLocation}
                            activeOpacity={0.8}
                        >
                            {/* Map Background Placeholder */}
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
                                    </View>
                                )}

                                {/* Search Bar */}
                                <View style={[
                                    styles.locationSearchBar,
                                    {
                                        backgroundColor: isDark ? 'rgba(61, 38, 26, 0.9)' : 'rgba(255,255,255,0.9)',
                                        borderColor: theme.border,
                                    }
                                ]}>
                                    <Ionicons name="search" size={20} color={theme.textSub} />
                                    <Text style={[styles.locationSearchText, { color: location ? theme.textMain : theme.textSub }]}>
                                        {location ? getLocationString() : 'Konum ara...'}
                                    </Text>
                                    {location && (
                                        <TouchableOpacity onPress={clearLocation}>
                                            <Ionicons name="close" size={20} color={theme.textSub} />
                                        </TouchableOpacity>
                                    )}
                                    {isGettingLocation && (
                                        <ActivityIndicator size="small" color={theme.primary} />
                                    )}
                                </View>

                                {/* Location Pin */}
                                {location && (
                                    <View style={styles.locationPin}>
                                        <Ionicons name="location" size={36} color="#B91C1C" />
                                    </View>
                                )}

                                {/* Pin instruction */}
                                <View style={[styles.pinInstruction, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)' }]}>
                                    <Text style={[styles.pinInstructionText, { color: theme.textSub }]}>
                                        {location ? 'Konum seçildi' : 'Konum eklemek için dokun'}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Mood Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: theme.textSub }]}>
                            RUH HALİ
                        </Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.moodContainer}
                        >
                            {MOODS.map((mood) => {
                                const isSelected = selectedMood === mood.id;
                                return (
                                    <TouchableOpacity
                                        key={mood.id}
                                        style={[
                                            styles.moodButton,
                                            {
                                                backgroundColor: isSelected
                                                    ? theme.primary
                                                    : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
                                                borderColor: isSelected ? theme.primary : 'transparent',
                                            }
                                        ]}
                                        onPress={() => setSelectedMood(isSelected ? null : mood.id)}
                                        activeOpacity={0.8}
                                    >
                                        <MaterialCommunityIcons
                                            name={
                                                mood.id === 'adventure' ? 'terrain' :
                                                    mood.id === 'peaceful' ? 'spa' :
                                                        mood.id === 'discovery' ? 'compass' : 'heart'
                                            }
                                            size={28}
                                            color={isSelected ? '#2C1810' : theme.textSub}
                                        />
                                        <Text style={[
                                            styles.moodLabel,
                                            { color: isSelected ? '#2C1810' : theme.textSub }
                                        ]}>
                                            {mood.label}
                                        </Text>
                                        {isSelected && (
                                            <View style={styles.moodSelectedDot} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Template Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: theme.textSub }]}>
                            ŞABLON SEÇİMİ
                        </Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.templateContainer}
                        >
                            {TEMPLATES.map((template) => {
                                const isSelected = selectedTemplate === template.id;
                                return (
                                    <TouchableOpacity
                                        key={template.id}
                                        style={styles.templateButton}
                                        onPress={() => setSelectedTemplate(isSelected ? null : template.id)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[
                                            styles.templatePreview,
                                            {
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
                                                borderColor: isSelected ? theme.primary : theme.border,
                                                borderWidth: isSelected ? 2 : 1,
                                            }
                                        ]}>
                                            {/* Template preview lines */}
                                            <View style={[styles.templateLine, { width: '50%', backgroundColor: isDark ? '#666' : '#999' }]} />
                                            <View style={[styles.templateLine, { width: '100%', backgroundColor: isDark ? '#555' : '#ccc', height: 2 }]} />
                                            <View style={[styles.templateLine, { width: '80%', backgroundColor: isDark ? '#555' : '#ccc', height: 2 }]} />
                                            <View style={[styles.templateLine, { width: '100%', backgroundColor: isDark ? '#555' : '#ccc', height: 2 }]} />
                                        </View>
                                        <Text style={[
                                            styles.templateLabel,
                                            { color: isSelected ? theme.primary : theme.textSub }
                                        ]}>
                                            {template.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Writing Section */}
                    <View style={styles.writingSection}>
                        {/* Formatting Toolbar */}
                        <View style={[
                            styles.toolbar,
                            {
                                backgroundColor: isDark ? 'rgba(44, 24, 16, 0.95)' : 'rgba(245, 241, 232, 0.95)',
                                borderColor: theme.border,
                            }
                        ]}>
                            <TouchableOpacity style={styles.toolbarButton}>
                                <Text style={[styles.toolbarH1, { color: theme.textMain }]}>H1</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolbarButton}>
                                <Text style={[styles.toolbarH2, { color: theme.textMain }]}>H2</Text>
                            </TouchableOpacity>
                            <View style={[styles.toolbarDivider, { backgroundColor: theme.border }]} />
                            <TouchableOpacity style={styles.toolbarButton}>
                                <Ionicons name="text" size={20} color={theme.textSub} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolbarButton}>
                                <Text style={[styles.toolbarBold, { color: theme.textSub }]}>B</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolbarButton}>
                                <Text style={[styles.toolbarItalic, { color: theme.textSub }]}>I</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolbarButton}>
                                <Ionicons name="brush" size={20} color={theme.primary} />
                            </TouchableOpacity>
                            <View style={[styles.toolbarDivider, { backgroundColor: theme.border }]} />
                            <TouchableOpacity style={styles.toolbarButton}>
                                <Ionicons name="list" size={20} color={theme.textSub} />
                            </TouchableOpacity>
                        </View>

                        {/* Title Input */}
                        <TextInput
                            style={[
                                styles.titleInput,
                                { color: theme.textMain }
                            ]}
                            placeholder="Başlık (Opsiyonel)"
                            placeholderTextColor={`${theme.textSub}60`}
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
                                placeholder="Bugünkü hikayeni anlatmaya başla..."
                                placeholderTextColor={`${theme.textSub}60`}
                                value={content}
                                onChangeText={setContent}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
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
    headerSpacer: {
        width: 60,
    },
    headerTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    publishButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs + 2,
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
        paddingHorizontal: Spacing.lg,
    },

    // Date Stamp
    dateStampContainer: {
        alignItems: 'flex-end',
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
    },
    dateStamp: {
        borderWidth: 2,
        borderStyle: 'dashed',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: 4,
        transform: [{ rotate: '-2deg' }],
    },
    dateStampText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 11,
        letterSpacing: 2,
    },

    // Section
    section: {
        marginTop: Spacing.lg,
    },
    sectionLabel: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 11,
        letterSpacing: 2,
        marginBottom: Spacing.sm,
        paddingHorizontal: 4,
    },

    // Upload Area
    uploadArea: {
        height: 128,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    uploadIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadText: {
        fontFamily: Typography.fonts.ui,
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: Spacing.lg,
    },

    // Polaroid
    polaroidContainer: {
        paddingTop: Spacing.md,
        paddingBottom: Spacing.lg,
        gap: Spacing.md,
    },
    polaroidCard: {
        width: 144,
        backgroundColor: '#FFFFFF',
        padding: 8,
        paddingBottom: 24,
        borderRadius: 2,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 2, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    polaroidRemove: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        backgroundColor: '#EF4444',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
    polaroidImageContainer: {
        aspectRatio: 4 / 5,
        backgroundColor: '#F3F4F6',
        overflow: 'hidden',
        marginBottom: 8,
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
        fontSize: 11,
        color: '#6B7280',
    },

    // Location
    locationCard: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
    },
    mapPreview: {
        height: 192,
        position: 'relative',
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
    locationSearchBar: {
        position: 'absolute',
        top: Spacing.sm,
        left: Spacing.sm,
        right: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs + 2,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        gap: Spacing.xs,
    },
    locationSearchText: {
        flex: 1,
        fontFamily: Typography.fonts.ui,
        fontSize: 14,
    },
    locationPin: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -18,
        marginTop: -36,
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

    // Mood
    moodContainer: {
        gap: Spacing.sm,
        paddingVertical: Spacing.xs,
    },
    moodButton: {
        width: 80,
        height: 80,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        borderWidth: 2,
        position: 'relative',
    },
    moodLabel: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 11,
    },
    moodSelectedDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#2C1810',
        opacity: 0.4,
    },

    // Template
    templateContainer: {
        gap: Spacing.md,
        paddingVertical: Spacing.xs,
    },
    templateButton: {
        width: 100,
        gap: Spacing.xs,
    },
    templatePreview: {
        height: 64,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xs,
        gap: 6,
        justifyContent: 'center',
    },
    templateLine: {
        height: 4,
        borderRadius: 2,
        opacity: 0.6,
    },
    templateLabel: {
        fontFamily: Typography.fonts.ui,
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
    },

    // Divider
    divider: {
        height: 1,
        marginVertical: Spacing.xl,
        marginHorizontal: -Spacing.lg,
        opacity: 0.5,
    },

    // Writing Section
    writingSection: {
        gap: Spacing.md,
    },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.xs,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        gap: 4,
        marginHorizontal: -Spacing.lg,
        marginBottom: Spacing.sm,
    },
    toolbarButton: {
        padding: Spacing.xs,
        minWidth: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
    },
    toolbarH1: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
        fontWeight: '700',
    },
    toolbarH2: {
        fontFamily: Typography.fonts.heading,
        fontSize: 16,
        fontWeight: '700',
    },
    toolbarBold: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 18,
        fontWeight: '700',
    },
    toolbarItalic: {
        fontFamily: Typography.fonts.bodyItalic,
        fontSize: 18,
    },
    toolbarDivider: {
        width: 1,
        height: 20,
        marginHorizontal: 4,
    },

    // Title Input
    titleInput: {
        fontFamily: Typography.fonts.heading,
        fontSize: 30,
        fontWeight: '700',
        letterSpacing: -0.5,
        padding: 0,
    },

    // Content Input
    journalContainer: {
        minHeight: 400,
    },
    contentInput: {
        fontFamily: Typography.fonts.body,
        fontSize: 18,
        lineHeight: 32,
        padding: 0,
        textAlignVertical: 'top',
    },
});
