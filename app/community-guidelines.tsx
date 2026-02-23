import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CommunityGuidelinesScreen() {
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();

    const sections = [
        {
            title: t('guidelines.respectTitle') || 'Respect the Community',
            content: t('guidelines.respectDesc') || 'Odyssey Journal is a place for travelers to share their real experiences. Treat others with respect. Hate speech, harassment, bullying, and discrimination of any kind are strictly prohibited.'
        },
        {
            title: t('guidelines.authenticTitle') || 'Share Authentic Travel',
            content: t('guidelines.authenticDesc') || 'Focus on travel, places, culture, and your personal journey. Do not post spam, advertisements, political propaganda, or unrelated content. Accounts created solely for promotional purposes may be removed.'
        },
        {
            title: t('guidelines.safeTitle') || 'Keep it Safe & SFW',
            content: t('guidelines.safeDesc') || 'Do not post nudity, sexually explicit content, or graphic violence. Ensure your photos and text are appropriate for a general audience.'
        },
        {
            title: t('guidelines.privacyTitle') || 'Respect Privacy',
            content: t('guidelines.privacyDesc') || 'Do not share personal information of others without their explicit consent. Be mindful of who and what you capture in your photos.'
        },
        {
            title: t('guidelines.enforcementTitle') || 'Enforcement',
            content: t('guidelines.enforcementDesc') || 'We review reported content and accounts. Violating these guidelines may result in content removal, restricted access, or permanent account deletion without warning.'
        }
    ];

    return (
        <ThemedView style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <ThemedText type="title" style={styles.headerTitle}>
                    {t('settings.communityGuidelines') || 'Community Guidelines'}
                </ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="earth" size={48} color={Colors.light.primary} />
                    </View>
                    <ThemedText style={styles.introText}>
                        {t('guidelines.intro') || 'Welcome to Odyssey Journal! We want to keep this space safe, inspiring, and focused on genuine travel experiences. Please follow these guidelines.'}
                    </ThemedText>
                </View>

                {sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.bullet} />
                            <ThemedText type="subtitle" style={styles.sectionTitle}>
                                {section.title}
                            </ThemedText>
                        </View>
                        <ThemedText style={styles.sectionContent}>
                            {section.content}
                        </ThemedText>
                    </View>
                ))}

                <View style={styles.footer}>
                    <ThemedText style={styles.footerText}>
                        {t('guidelines.thankYou') || 'Thank you for helping us make Odyssey Journal a great place for travelers!'}
                    </ThemedText>
                </View>
            </ScrollView>
        </ThemedView>
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
        borderBottomColor: Colors.light.border,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 20,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl * 2,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${Colors.light.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    introText: {
        fontFamily: Typography.fonts.bodyItalic,
        textAlign: 'center',
        color: Colors.light.textMuted,
        lineHeight: 24,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.xs,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.light.primary,
    },
    sectionTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
    },
    sectionContent: {
        fontFamily: Typography.fonts.ui,
        color: Colors.light.text,
        lineHeight: 22,
        paddingLeft: Spacing.sm + 6,
        opacity: 0.8,
    },
    footer: {
        marginTop: Spacing.xl,
        paddingTop: Spacing.xl,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
        alignItems: 'center',
    },
    footerText: {
        fontFamily: Typography.fonts.bodyItalic,
        textAlign: 'center',
        color: Colors.light.primary,
    }
});
