import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { SelectedImage, useImagePicker } from '@/hooks/use-image-picker';
import { useLocationPicker } from '@/hooks/use-location-picker';
import { createPost } from '@/lib/posts';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CreatePostScreen() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        getLocationString,
    } = useLocationPicker();

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title for your post');
            return;
        }

        if (!content.trim()) {
            Alert.alert('Error', 'Please enter some content for your post');
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

            Alert.alert('Success', 'Your post has been created!', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert('Error', 'Failed to create post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const showImageOptions = () => {
        Alert.alert('Add Photos', 'Choose an option', [
            {
                text: 'Take Photo',
                onPress: takePhoto,
            },
            {
                text: 'Choose from Library',
                onPress: () => pickMultipleImages(5),
            },
            {
                text: 'Cancel',
                style: 'cancel',
            },
        ]);
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                        <Ionicons name="close" size={28} color={Colors.light.text} />
                    </TouchableOpacity>
                    <ThemedText type="subtitle" style={styles.headerTitle}>
                        Create Post
                    </ThemedText>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        style={[styles.headerButton, styles.publishButton]}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color={Colors.light.surface} />
                        ) : (
                            <Text style={styles.publishText}>Post</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Title Input */}
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Give your journey a title..."
                        placeholderTextColor={Colors.light.textMuted}
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                    />

                    {/* Content Input */}
                    <TextInput
                        style={styles.contentInput}
                        placeholder="Share your story..."
                        placeholderTextColor={Colors.light.textMuted}
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                    />

                    {/* Images */}
                    {images.length > 0 && (
                        <View style={styles.imagesContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {images.map((image, index) => (
                                    <View key={index} style={styles.imageWrapper}>
                                        <Image source={{ uri: image.uri }} style={styles.image} />
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => removeImage(index)}
                                        >
                                            <Ionicons name="close-circle" size={24} color={Colors.light.error} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Location */}
                    {location && (
                        <View style={styles.locationContainer}>
                            <Ionicons name="location" size={20} color={Colors.light.accent} />
                            <Text style={styles.locationText}>{getLocationString()}</Text>
                            <TouchableOpacity onPress={clearLocation}>
                                <Ionicons name="close-circle" size={20} color={Colors.light.textMuted} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={showImageOptions}
                            disabled={isPickingImage || images.length >= 5}
                        >
                            <Ionicons
                                name="images"
                                size={24}
                                color={images.length >= 5 ? Colors.light.textMuted : Colors.light.accent}
                            />
                            <Text
                                style={[
                                    styles.actionText,
                                    images.length >= 5 && styles.actionTextDisabled,
                                ]}
                            >
                                Add Photos ({images.length}/5)
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={getCurrentLocation}
                            disabled={isGettingLocation}
                        >
                            {isGettingLocation ? (
                                <ActivityIndicator size="small" color={Colors.light.accent} />
                            ) : (
                                <Ionicons name="location" size={24} color={Colors.light.accent} />
                            )}
                            <Text style={styles.actionText}>
                                {location ? 'Change Location' : 'Add Location'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    headerButton: {
        padding: Spacing.xs,
        minWidth: 60,
    },
    headerTitle: {
        fontFamily: Typography.fonts.heading,
    },
    publishButton: {
        backgroundColor: Colors.light.accent,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    publishText: {
        color: Colors.light.surface,
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
    },
    content: {
        flex: 1,
        padding: Spacing.md,
    },
    titleInput: {
        fontFamily: Typography.fonts.heading,
        fontSize: 24,
        color: Colors.light.text,
        marginBottom: Spacing.md,
        padding: 0,
    },
    contentInput: {
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        color: Colors.light.text,
        lineHeight: 26,
        minHeight: 200,
        padding: 0,
    },
    imagesContainer: {
        marginVertical: Spacing.lg,
    },
    imageWrapper: {
        marginRight: Spacing.md,
        position: 'relative',
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: BorderRadius.md,
    },
    removeImageButton: {
        position: 'absolute',
        top: Spacing.xs,
        right: Spacing.xs,
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    locationText: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.text,
    },
    actionsContainer: {
        gap: Spacing.md,
        marginTop: Spacing.lg,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.md,
        gap: Spacing.md,
    },
    actionText: {
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        color: Colors.light.text,
    },
    actionTextDisabled: {
        color: Colors.light.textMuted,
    },
});
