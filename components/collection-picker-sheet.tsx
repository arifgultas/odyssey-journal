import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Collection } from '@/lib/collections';
import { createCollection, getCollections } from '@/lib/collections';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CollectionPickerSheetProps {
    visible: boolean;
    postId: string;
    onClose: () => void;
    onSuccess?: (collectionId: string | null) => void;
}

export function CollectionPickerSheet({
    visible,
    postId,
    onClose,
    onSuccess,
}: CollectionPickerSheetProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showQuickCreate, setShowQuickCreate] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    const modalBgColor = isDark ? '#2C1810' : '#F5F1E8';
    const cardBgColor = isDark ? 'rgba(245, 241, 232, 0.1)' : 'rgba(44, 24, 16, 0.05)';
    const textColor = isDark ? '#F5F1E8' : '#2C1810';
    const textSecondary = isDark ? 'rgba(245, 241, 232, 0.6)' : 'rgba(44, 24, 16, 0.6)';
    const borderColor = isDark ? 'rgba(212, 165, 116, 0.25)' : 'rgba(139, 115, 85, 0.3)';

    // Load collections
    const loadCollections = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getCollections();
            setCollections(data);
        } catch (error) {
            console.error('Error loading collections:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (visible) {
            loadCollections();
            setSelectedCollectionId(null);
            setShowQuickCreate(false);
            setNewCollectionName('');

            // Slide up animation
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 65,
                useNativeDriver: true,
            }).start();
        } else {
            // Slide down animation
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // First, bookmark the post (with optional collection)
            const { bookmarkPost } = await import('@/lib/interactions');
            await bookmarkPost(postId, selectedCollectionId || undefined);

            onSuccess?.(selectedCollectionId);
            handleClose();
        } catch (error) {
            console.error('Error saving to collection:', error);
            Alert.alert('Hata', 'Kaydetme sırasında bir hata oluştu');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) {
            return;
        }

        setIsCreating(true);
        try {
            const newCollection = await createCollection({
                name: newCollectionName.trim(),
            });

            // Add to list and select it
            setCollections((prev) => [newCollection, ...prev]);
            setSelectedCollectionId(newCollection.id);
            setShowQuickCreate(false);
            setNewCollectionName('');
        } catch (error) {
            console.error('Error creating collection:', error);
            Alert.alert('Hata', 'Koleksiyon oluşturulamadı');
        } finally {
            setIsCreating(false);
        }
    };

    const renderCollectionItem = ({ item }: { item: Collection }) => {
        const isSelected = selectedCollectionId === item.id;

        return (
            <TouchableOpacity
                onPress={() => setSelectedCollectionId(isSelected ? null : item.id)}
                style={[
                    styles.collectionItem,
                    { backgroundColor: cardBgColor, borderColor: isSelected ? '#D4A574' : borderColor },
                    isSelected && styles.collectionItemSelected,
                ]}
                activeOpacity={0.8}
            >
                {/* Thumbnail */}
                <View style={[styles.collectionThumbnail, { backgroundColor: item.color }]}>
                    {item.cover_image_url ? (
                        <Image
                            source={{ uri: item.cover_image_url }}
                            style={styles.thumbnailImage}
                            contentFit="cover"
                        />
                    ) : (
                        <Ionicons name="folder" size={24} color="#F5F1E8" />
                    )}
                </View>

                {/* Info */}
                <View style={styles.collectionItemInfo}>
                    <Text style={[styles.collectionItemName, { color: textColor }]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={[styles.collectionItemCount, { color: textSecondary }]}>
                        {item.post_count} gönderi
                    </Text>
                </View>

                {/* Checkbox */}
                <View
                    style={[
                        styles.checkbox,
                        { borderColor: isSelected ? '#D4A574' : borderColor },
                        isSelected && styles.checkboxSelected,
                    ]}
                >
                    {isSelected && <Ionicons name="checkmark" size={16} color="#2C1810" />}
                </View>
            </TouchableOpacity>
        );
    };

    const renderHeader = () => (
        <View>
            {/* Quick Create Button */}
            <TouchableOpacity
                onPress={() => setShowQuickCreate(true)}
                style={[styles.createButton, { backgroundColor: cardBgColor, borderColor: borderColor }]}
                activeOpacity={0.8}
            >
                <View style={[styles.createButtonIcon, { backgroundColor: '#D4A574' }]}>
                    <Ionicons name="add" size={20} color="#2C1810" />
                </View>
                <Text style={[styles.createButtonText, { color: textColor }]}>
                    Yeni Koleksiyon Oluştur
                </Text>
            </TouchableOpacity>

            {/* Skip option - save without collection */}
            <TouchableOpacity
                onPress={() => {
                    setSelectedCollectionId(null);
                    handleSave();
                }}
                style={[styles.skipButton, { borderColor: borderColor }]}
                activeOpacity={0.8}
            >
                <Ionicons name="bookmark-outline" size={20} color={textSecondary} />
                <Text style={[styles.skipButtonText, { color: textSecondary }]}>
                    Koleksiyonsuz Kaydet
                </Text>
            </TouchableOpacity>

            {/* Collections label */}
            {collections.length > 0 && (
                <Text style={[styles.sectionLabel, { color: textSecondary }]}>
                    Koleksiyonlarım
                </Text>
            )}
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="folder-outline" size={48} color={textSecondary} />
            <Text style={[styles.emptyText, { color: textSecondary }]}>
                Henüz koleksiyon yok
            </Text>
            <Text style={[styles.emptySubtext, { color: textSecondary }]}>
                İlk koleksiyonunuzu oluşturun
            </Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            {/* Backdrop */}
            <Pressable style={styles.backdrop} onPress={handleClose}>
                <View style={StyleSheet.absoluteFill} />
            </Pressable>

            {/* Sheet */}
            <Animated.View
                style={[
                    styles.sheet,
                    {
                        backgroundColor: modalBgColor,
                        paddingBottom: insets.bottom,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                {/* Handle */}
                <View style={styles.handleContainer}>
                    <View style={[styles.handle, { backgroundColor: borderColor }]} />
                </View>

                {/* Header */}
                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                    <Text style={[styles.headerTitle, { color: textColor }]}>
                        Koleksiyona Kaydet
                    </Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Quick Create Form */}
                {showQuickCreate && (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <View style={[styles.quickCreateForm, { backgroundColor: cardBgColor, borderColor: borderColor }]}>
                            <TextInput
                                style={[styles.quickCreateInput, { color: textColor }]}
                                placeholder="Koleksiyon adı..."
                                placeholderTextColor={textSecondary}
                                value={newCollectionName}
                                onChangeText={setNewCollectionName}
                                autoFocus
                                maxLength={50}
                            />
                            <View style={styles.quickCreateButtons}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowQuickCreate(false);
                                        setNewCollectionName('');
                                    }}
                                    style={styles.quickCreateCancel}
                                >
                                    <Text style={[styles.quickCreateCancelText, { color: textSecondary }]}>
                                        İptal
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleCreateCollection}
                                    disabled={!newCollectionName.trim() || isCreating}
                                    style={[
                                        styles.quickCreateSubmit,
                                        (!newCollectionName.trim() || isCreating) && styles.buttonDisabled,
                                    ]}
                                >
                                    {isCreating ? (
                                        <ActivityIndicator size="small" color="#2C1810" />
                                    ) : (
                                        <Text style={styles.quickCreateSubmitText}>Oluştur</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                )}

                {/* Collections List */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#D4A574" />
                    </View>
                ) : (
                    <FlatList
                        data={collections}
                        keyExtractor={(item) => item.id}
                        renderItem={renderCollectionItem}
                        ListHeaderComponent={renderHeader}
                        ListEmptyComponent={renderEmpty}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        style={styles.list}
                    />
                )}

                {/* Save Button */}
                {selectedCollectionId && (
                    <View style={[styles.footer, { borderTopColor: borderColor }]}>
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={isSaving}
                            style={[styles.saveButton, isSaving && styles.buttonDisabled]}
                        >
                            {isSaving ? (
                                <ActivityIndicator size="small" color="#2C1810" />
                            ) : (
                                <>
                                    <Ionicons name="bookmark" size={20} color="#2C1810" />
                                    <Text style={styles.saveButtonText}>Kaydet</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: SCREEN_HEIGHT * 0.75,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        ...Shadows.lg,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: Typography.fonts.heading,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        marginBottom: Spacing.sm,
        gap: Spacing.md,
    },
    createButtonIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButtonText: {
        fontSize: 15,
        fontWeight: '600',
        fontFamily: Typography.fonts.ui,
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    skipButtonText: {
        fontSize: 14,
        fontFamily: Typography.fonts.ui,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: Typography.fonts.ui,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: Spacing.sm,
    },
    collectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        marginBottom: Spacing.sm,
        gap: Spacing.md,
    },
    collectionItemSelected: {
        borderWidth: 2,
    },
    collectionThumbnail: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    collectionItemInfo: {
        flex: 1,
    },
    collectionItemName: {
        fontSize: 15,
        fontWeight: '600',
        fontFamily: Typography.fonts.ui,
        marginBottom: 2,
    },
    collectionItemCount: {
        fontSize: 12,
        fontFamily: Typography.fonts.ui,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#D4A574',
        borderColor: '#D4A574',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        gap: Spacing.sm,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: Typography.fonts.ui,
    },
    emptySubtext: {
        fontSize: 14,
        fontFamily: Typography.fonts.ui,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xl * 2,
    },
    quickCreateForm: {
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    quickCreateInput: {
        fontSize: 16,
        fontFamily: Typography.fonts.body,
        paddingVertical: Spacing.sm,
    },
    quickCreateButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: Spacing.md,
        marginTop: Spacing.sm,
    },
    quickCreateCancel: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    quickCreateCancelText: {
        fontSize: 14,
        fontFamily: Typography.fonts.ui,
    },
    quickCreateSubmit: {
        backgroundColor: '#D4A574',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
    },
    quickCreateSubmitText: {
        color: '#2C1810',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: Typography.fonts.uiBold,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    footer: {
        padding: Spacing.lg,
        borderTopWidth: 1,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D4A574',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },
    saveButtonText: {
        color: '#2C1810',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: Typography.fonts.uiBold,
    },
});
