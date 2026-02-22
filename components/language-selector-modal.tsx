/**
 * Language Selector Modal
 * UI component for selecting the app language
 */

import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LanguageCode, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface LanguageSelectorModalProps {
    visible: boolean;
    onClose: () => void;
}

interface LanguageItem {
    code: LanguageCode;
    name: string;
    nativeName: string;
    flag: string;
}

export function LanguageSelectorModal({ visible, onClose }: LanguageSelectorModalProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { language, setLanguage, t } = useLanguage();

    const languages: LanguageItem[] = Object.entries(SUPPORTED_LANGUAGES).map(
        ([code, info]) => ({
            code: code as LanguageCode,
            ...info,
        })
    );

    const handleSelectLanguage = async (code: LanguageCode) => {
        await setLanguage(code);
        onClose();
    };

    const renderLanguageItem = ({ item }: { item: LanguageItem }) => {
        const isSelected = language === item.code;

        return (
            <TouchableOpacity
                style={[
                    styles.languageItem,
                    {
                        backgroundColor: isSelected
                            ? `${theme.accent}20`
                            : theme.surface,
                        borderColor: isSelected ? theme.accent : theme.border,
                    }
                ]}
                onPress={() => handleSelectLanguage(item.code)}
                activeOpacity={0.7}
            >
                <View style={styles.languageInfo}>
                    <Text style={styles.flag}>{item.flag}</Text>
                    <View style={styles.languageNames}>
                        <Text style={[styles.nativeName, { color: theme.text }]}>
                            {item.nativeName}
                        </Text>
                        {item.name !== item.nativeName && (
                            <Text style={[styles.englishName, { color: theme.textMuted }]}>
                                {item.name}
                            </Text>
                        )}
                    </View>
                </View>
                {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={theme.accent} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                    <SafeAreaView style={styles.safeArea}>
                        {/* Header */}
                        <View style={[styles.header, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.title, { color: theme.text }]}>
                                {t('settings.language')}
                            </Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Language List */}
                        <FlatList
                            data={languages}
                            keyExtractor={(item) => item.code}
                            renderItem={renderLanguageItem}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    </SafeAreaView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        maxHeight: '100%',
        minHeight: '70%',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: 20,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    listContent: {
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    languageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    flag: {
        fontSize: 32,
    },
    languageNames: {
        gap: 2,
    },
    nativeName: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
    },
    englishName: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
    },
});

export default LanguageSelectorModal;
