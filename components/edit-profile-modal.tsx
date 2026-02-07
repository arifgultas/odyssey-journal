import { Colors, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useUpdateProfile, useUploadAvatar } from '@/hooks/use-profile';
import type { Profile } from '@/lib/types/profile';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface EditProfileModalProps {
    visible: boolean;
    profile: Profile;
    onClose: () => void;
    onSuccess?: () => void;
}

export function EditProfileModal({
    visible,
    profile,
    onClose,
    onSuccess,
}: EditProfileModalProps) {
    const [fullName, setFullName] = useState(profile.full_name || '');
    const [username, setUsername] = useState(profile.username || '');
    const [bio, setBio] = useState(profile.bio || '');
    const [website, setWebsite] = useState(profile.website || '');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    const { t } = useLanguage();
    const updateProfile = useUpdateProfile();
    const uploadAvatar = useUploadAvatar();

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(t('editProfile.permissionNeeded'), t('editProfile.permissionMessage'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        try {
            let newAvatarUrl: string | undefined = profile.avatar_url || undefined;

            // Upload new avatar if selected
            if (avatarUri) {
                console.log('Uploading avatar...');
                const uploadedUrl = await uploadAvatar.mutateAsync({
                    uri: avatarUri,
                    userId: profile.id,
                });
                console.log('Avatar uploaded:', uploadedUrl);
                if (uploadedUrl) {
                    newAvatarUrl = uploadedUrl;
                }
            }

            // Update profile with all data including new avatar URL
            console.log('Updating profile with avatar URL:', newAvatarUrl);
            await updateProfile.mutateAsync({
                full_name: fullName.trim() || undefined,
                username: username.trim() || undefined,
                bio: bio.trim() || undefined,
                website: website.trim() || undefined,
                avatar_url: newAvatarUrl,
            });

            console.log('Profile updated successfully');

            // Call success callback BEFORE closing modal
            if (onSuccess) {
                console.log('Calling onSuccess callback...');
                await onSuccess();
            }

            Alert.alert(t('common.success'), t('editProfile.updateSuccess'));
            onClose();
        } catch (error: any) {
            console.error('Error in handleSave:', error);
            Alert.alert(t('common.error'), error.message || t('editProfile.updateError'));
        }
    };

    const isLoading = updateProfile.isPending || uploadAvatar.isPending;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} disabled={isLoading}>
                        <Text style={styles.cancelButton}>{t('editProfile.cancel')}</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{t('editProfile.title')}</Text>
                    <TouchableOpacity onPress={handleSave} disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color={Colors.light.primary} />
                        ) : (
                            <Text style={styles.saveButton}>{t('editProfile.save')}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Avatar */}
                    <View style={styles.avatarSection}>
                        <TouchableOpacity onPress={handlePickImage} disabled={isLoading}>
                            {avatarUri || profile.avatar_url ? (
                                <Image
                                    key={avatarUri || profile.avatar_url}
                                    source={{ uri: avatarUri || profile.avatar_url || '' }}
                                    style={styles.avatar}
                                    contentFit="cover"
                                    transition={200}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>
                                        {fullName?.charAt(0).toUpperCase() ||
                                            username?.charAt(0).toUpperCase() ||
                                            'U'}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.cameraIcon}>
                                <Ionicons name="camera" size={20} color={Colors.light.surface} />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.changePhotoText}>{t('editProfile.changePhoto')}</Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('editProfile.fullName')}</Text>
                            <TextInput
                                style={styles.input}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder={t('editProfile.fullNamePlaceholder')}
                                placeholderTextColor={Colors.light.textSecondary}
                                editable={!isLoading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('editProfile.username')}</Text>
                            <TextInput
                                style={styles.input}
                                value={username}
                                onChangeText={setUsername}
                                placeholder={t('editProfile.usernamePlaceholder')}
                                placeholderTextColor={Colors.light.textSecondary}
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('editProfile.bio')}</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder={t('editProfile.bioPlaceholder')}
                                placeholderTextColor={Colors.light.textSecondary}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                editable={!isLoading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('editProfile.website')}</Text>
                            <TextInput
                                style={styles.input}
                                value={website}
                                onChangeText={setWebsite}
                                placeholder={t('editProfile.websitePlaceholder')}
                                placeholderTextColor={Colors.light.textSecondary}
                                autoCapitalize="none"
                                keyboardType="url"
                                editable={!isLoading}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: 60,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
        color: Colors.light.text,
    },
    cancelButton: {
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        color: Colors.light.textSecondary,
    },
    saveButton: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        color: Colors.light.primary,
    },
    content: {
        flex: 1,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: Colors.light.primary,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.light.accent,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: Colors.light.primary,
    },
    avatarText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 40,
        color: Colors.light.surface,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.light.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.light.surface,
    },
    changePhotoText: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.primary,
        marginTop: Spacing.md,
    },
    form: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 14,
        color: Colors.light.text,
        marginBottom: Spacing.sm,
    },
    input: {
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        color: Colors.light.text,
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 8,
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
    },
    textArea: {
        minHeight: 100,
        paddingTop: 12,
    },
});
