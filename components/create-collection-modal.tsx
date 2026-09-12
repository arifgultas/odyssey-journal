import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Collection } from '@/lib/collections';
import { createCollection, updateCollection } from '@/lib/collections';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Preset renk seçenekleri
const PRESET_COLORS = [
    '#D4A574', // Altın/Kahve
    '#8B7355', // Koyu kahve
    '#C9A86C', // Bal
    '#E8D5B7', // Krem
    '#5D4037', // Çikolata
    '#795548', // Kahve
    '#A1887F', // Açık kahve
    '#BCAAA4', // Gri-kahve
    '#6D4C41', // Koyu çikolata
    '#4E342E', // Espresso
];

interface CreateCollectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: (collection: Collection) => void;
    editCollection?: Collection | null; // Düzenleme modu için
}

export function CreateCollectionModal({
    visible,
    onClose,
    onSuccess,
    editCollection,
}: CreateCollectionModalProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();
    const { t, language } = useLanguage();

    const [name, setName] = useState(editCollection?.name || '');
    const [selectedColor, setSelectedColor] = useState(editCollection?.color || PRESET_COLORS[0]);
    const [isLoading, setIsLoading] = useState(false);

    const isEditMode = !!editCollection;

    // Reset form when modal opens/closes
    React.useEffect(() => {
        if (visible) {
            setName(editCollection?.name || '');
            setSelectedColor(editCollection?.color || PRESET_COLORS[0]);
        }
    }, [visible, editCollection]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert(t('collection.errorTitle'), t('collection.nameRequired'));
            return;
        }

        setIsLoading(true);
        try {
            let collection: Collection;

            if (isEditMode && editCollection) {
                // Update existing collection
                collection = await updateCollection(editCollection.id, {
                    name: name.trim(),
                    color: selectedColor,
                });
            } else {
                // Create new collection
                collection = await createCollection({
                    name: name.trim(),
                    color: selectedColor,
                });
            }

            onSuccess?.(collection);
            onClose();
        } catch (error) {
            console.error('Error saving collection:', error);
            Alert.alert(t('collection.errorTitle'), isEditMode ? t('collection.updateError') : t('collection.createError'));
        } finally {
            setIsLoading(false);
        }
    };

    const modalBgColor = isDark ? '#2C1810' : '#F5F1E8';
    const inputBgColor = isDark ? 'rgba(245, 241, 232, 0.1)' : 'rgba(44, 24, 16, 0.05)';
    const textColor = isDark ? '#F5F1E8' : '#2C1810';
    const textSecondary = isDark ? 'rgba(245, 241, 232, 0.6)' : 'rgba(44, 24, 16, 0.6)';
    const borderColor = isDark ? 'rgba(212, 165, 116, 0.25)' : 'rgba(139, 115, 85, 0.3)';

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior="padding"
                style={[styles.container, { backgroundColor: modalBgColor }]}
            >
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, borderBottomColor: borderColor }]}>
                    <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                        <Ionicons name="close" size={24} color={textColor} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: textColor }]}>
                        {isEditMode ? t('collection.editTitle') : t('collection.createTitle')}
                    </Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isLoading || !name.trim()}
                        style={[
                            styles.saveButton,
                            (!name.trim() || isLoading) && styles.saveButtonDisabled,
                        ]}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#2C1810" />
                        ) : (
                            <Text style={styles.saveButtonText}>{t('collection.save')}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                >
                    {/* Collection Name */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: textSecondary }]}>
                            {t('collection.collectionName')}
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: inputBgColor,
                                    color: textColor,
                                    borderColor: borderColor,
                                },
                            ]}
                            placeholder={t('collection.namePlaceholder')}
                            placeholderTextColor={textSecondary}
                            value={name}
                            onChangeText={setName}
                            maxLength={50}
                            autoFocus={false}
                        />
                        <Text style={[styles.charCount, { color: textSecondary }]}>
                            {name.length}/50
                        </Text>
                    </View>



                    {/* Color Selection */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: textSecondary }]}>
                            {t('collection.themeColor')}
                        </Text>
                        <View style={styles.colorGrid}>
                            {PRESET_COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => setSelectedColor(color)}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.colorOptionSelected,
                                    ]}
                                >
                                    {selectedColor === color && (
                                        <Ionicons name="checkmark" size={20} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Preview */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: textSecondary }]}>
                            {t('collection.preview')}
                        </Text>
                        <View style={styles.previewContainer}>
                            <View
                                style={[
                                    styles.previewCard,
                                    { backgroundColor: selectedColor },
                                ]}
                            >
                                <View style={[styles.previewImage, { backgroundColor: selectedColor }]} />
                                <View style={styles.previewGradient} />
                                <View style={styles.previewInfo}>
                                    <Text style={styles.previewName}>
                                        {name || t('collection.collectionName')}
                                    </Text>
                                    <View style={styles.previewMeta}>
                                        <MaterialIcons name="photo-library" size={10} color="#D4A574" />
                                        <Text style={styles.previewCount}>{t('collection.zeroPosts')}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: Typography.fonts.heading,
    },
    saveButton: {
        backgroundColor: '#D4A574',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
        minWidth: 80,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: '#2C1810',
        fontFamily: Typography.fonts.uiBold,
        fontSize: 14,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionLabel: {
        fontSize: 13,
        fontFamily: Typography.fonts.uiBold,
        marginBottom: Spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        fontSize: 16,
        fontFamily: Typography.fonts.body,
    },
    charCount: {
        fontSize: 12,
        fontFamily: Typography.fonts.ui,
        textAlign: 'right',
        marginTop: Spacing.xs,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    colorOption: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.sm,
    },
    colorOptionSelected: {
        borderWidth: 3,
        borderColor: '#fff',
        ...Shadows.md,
    },
    previewContainer: {
        alignItems: 'center',
    },
    previewCard: {
        width: 140,
        aspectRatio: 3 / 4,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.lg,
    },
    previewImage: {
        ...StyleSheet.absoluteFillObject,
    },
    previewGradient: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        // Simple gradient simulation
    },
    previewInfo: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
    },
    previewName: {
        fontSize: 16,
        color: '#F5F1E8',
        fontFamily: Typography.fonts.heading,
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    previewMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    previewCount: {
        fontSize: 10,
        color: '#D4A574',
        fontFamily: Typography.fonts.ui,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
