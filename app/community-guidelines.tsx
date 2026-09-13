import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { safeGoBack } from '@/lib/navigation';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mirrorIcon } from '@/lib/rtl';

export default function CommunityGuidelinesScreen() {
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const sections = [
        {
            title: t('guidelines.respectTitle'),
            content: t('guidelines.respectDesc')
        },
        {
            title: t('guidelines.authenticTitle'),
            content: t('guidelines.authenticDesc')
        },
        {
            title: t('guidelines.safeTitle'),
            content: t('guidelines.safeDesc')
        },
        {
            title: t('guidelines.privacyTitle'),
            content: t('guidelines.privacyDesc')
        },
        {
            title: t('guidelines.enforcementTitle'),
            content: t('guidelines.enforcementDesc')
        }
    ];

    return (
        <ThemedView style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => safeGoBack('/settings')} style={styles.backButton}>
                    <Ionicons name={mirrorIcon('arrow-back')} size={24} color={theme.text} />
                </TouchableOpacity>
                <ThemedText type="title" style={styles.headerTitle}>
                    {t('settings.communityGuidelines')}
                </ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.iconContainer}>
                    <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}20` }]}>
                        <Ionicons name="earth" size={48} color={theme.primary} />
                    </View>
                    <ThemedText style={[styles.introText, { color: theme.textMuted }]}>
                        {t('guidelines.intro')}
                    </ThemedText>
                </View>

                {sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.bullet, { backgroundColor: theme.accent }]} />
                            <ThemedText type="subtitle" style={styles.sectionTitle}>
                                {section.title}
                            </ThemedText>
                        </View>
                        <ThemedText style={[styles.sectionContent, { color: theme.text }]}>
                            {section.content}
                        </ThemedText>
                    </View>
                ))}

                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                    <ThemedText style={[styles.footerText, { color: theme.accent }]}>
                        {t('guidelines.thankYou')}
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
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    introText: {
        fontFamily: Typography.fonts.bodyItalic,
        textAlign: 'center',
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
    },
    sectionTitle: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
    },
    sectionContent: {
        fontFamily: Typography.fonts.ui,
        lineHeight: 22,
        paddingStart: Spacing.sm + 6,
        opacity: 0.8,
    },
    footer: {
        marginTop: Spacing.xl,
        paddingTop: Spacing.xl,
        borderTopWidth: 1,
        alignItems: 'center',
    },
    footerText: {
        fontFamily: Typography.fonts.bodyItalic,
        textAlign: 'center',
    }
});
