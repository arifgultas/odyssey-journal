import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { hasAiConsent, setAiConsent } from '@/lib/ai-consent';
import { openLegalPage } from '@/lib/legal-links';
import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AiConsentContextValue {
    /**
     * Resolves true when the signed-in reader has agreed to OpenAI moderation, asking first if
     * they have not. Call it before anything that sends a post or comment to moderation; on
     * false, stop without publishing.
     */
    ensureConsent: () => Promise<boolean>;
}

const AiConsentContext = createContext<AiConsentContextValue>({
    ensureConsent: async () => false,
});

export const useAiConsent = () => useContext(AiConsentContext);

export function AiConsentProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [visible, setVisible] = useState(false);
    const pending = useRef<Promise<boolean> | null>(null);
    const resolvePending = useRef<((granted: boolean) => void) | null>(null);

    const ensureConsent = useCallback(async () => {
        if (!user) return false;
        if (await hasAiConsent(user.id)) return true;
        // A second tap while the dialog is open waits for the same answer instead of replacing it
        if (!pending.current) {
            pending.current = new Promise<boolean>((resolve) => {
                resolvePending.current = resolve;
                setVisible(true);
            });
        }
        return pending.current;
    }, [user]);

    const answer = async (granted: boolean) => {
        setVisible(false);
        if (granted && user) {
            // Written before answering, so the moderation layer (lib/content-moderation.ts), which
            // reads the same flag, sees it. Failing to persist only means being asked again.
            await setAiConsent(user.id, true).catch(() => { });
        }
        resolvePending.current?.(granted);
        resolvePending.current = null;
        pending.current = null;
    };

    const value = useMemo(() => ({ ensureConsent }), [ensureConsent]);

    return (
        <AiConsentContext.Provider value={value}>
            {children}
            <AiConsentModal visible={visible} onAnswer={answer} />
        </AiConsentContext.Provider>
    );
}

function AiConsentModal({ visible, onAnswer }: { visible: boolean; onAnswer: (granted: boolean) => void }) {
    const { t } = useLanguage();
    const { isDark } = useTheme();
    const colors = Colors[isDark ? 'dark' : 'light'];

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={() => onAnswer(false)}>
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                        <Ionicons name="shield-checkmark-outline" size={36} color={colors.accent} style={styles.icon} />
                        <Text style={[styles.title, { color: colors.text }]}>{t('aiConsent.title')}</Text>
                        <Text style={[styles.body, { color: colors.text }]}>{t('aiConsent.body')}</Text>
                        <Text style={[styles.body, { color: colors.textSecondary }]}>{t('aiConsent.detail')}</Text>
                        <TouchableOpacity onPress={() => openLegalPage('privacy')} accessibilityRole="link">
                            <Text style={[styles.link, { color: colors.compass }]}>{t('settings.privacyPolicy')}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.button, { borderColor: colors.border }]}
                            onPress={() => onAnswer(false)}
                            accessibilityRole="button"
                        >
                            <Text style={[styles.buttonText, { color: colors.textSecondary }]}>{t('aiConsent.notNow')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.accent, borderColor: colors.accent }]}
                            onPress={() => onAnswer(true)}
                            accessibilityRole="button"
                        >
                            <Text style={[styles.buttonText, { color: '#2C1810' }]}>{t('aiConsent.allow')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    card: {
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        maxHeight: '85%',
        overflow: 'hidden',
    },
    content: {
        padding: Spacing.lg,
        alignItems: 'center',
    },
    icon: {
        marginBottom: Spacing.sm,
    },
    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: 20,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    body: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    link: {
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    buttons: {
        flexDirection: 'row',
        gap: Spacing.sm,
        padding: Spacing.md,
    },
    button: {
        flex: 1,
        paddingVertical: Spacing.sm + 4,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
