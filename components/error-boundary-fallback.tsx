import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { t } from '@/lib/i18n';
import { Colors, Spacing, BorderRadius, Fonts } from '@/constants/theme';

interface ErrorBoundaryFallbackProps {
    error: Error;
    componentStack: string | null;
    resetError: () => void;
}

export function ErrorBoundaryFallback({ error, resetError }: ErrorBoundaryFallbackProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const activeColors = isDark ? Colors.dark : Colors.light;

    const [showDetails, setShowDetails] = useState(false);

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2C1810' : '#E8DCC8' }]}>
                    <Ionicons
                        name="compass-outline"
                        size={64}
                        color={activeColors.accent}
                        style={styles.icon}
                    />
                    <Ionicons
                        name="alert-circle"
                        size={24}
                        color={activeColors.error}
                        style={styles.badge}
                    />
                </View>

                <Text style={[styles.title, { color: activeColors.primary }]}>
                    {t('errors.boundaryTitle') || 'Pusulamız Şaşırdı!'}
                </Text>

                <Text style={[styles.subtitle, { color: activeColors.textSecondary }]}>
                    {t('errors.boundarySubtitle') || 'Beklenmedik bir hata oluştu. Seyahat rotamızı düzeltmek için çalışıyoruz.'}
                </Text>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: activeColors.primary }]}
                    onPress={resetError}
                    activeOpacity={0.8}
                >
                    <Ionicons name="refresh-outline" size={20} color={isDark ? '#1A1410' : '#F5F1E8'} />
                    <Text style={[styles.buttonText, { color: isDark ? '#1A1410' : '#F5F1E8' }]}>
                        {t('errors.boundaryRetry') || 'Yeniden Başlat'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.detailsToggle}
                    onPress={() => setShowDetails(!showDetails)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.detailsToggleText, { color: activeColors.compass }]}>
                        {showDetails
                            ? t('errors.boundaryHideDetails') || 'Hata Detayını Gizle'
                            : t('errors.boundaryShowDetails') || 'Hata Detayını Göster'}
                    </Text>
                    <Ionicons
                        name={showDetails ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={activeColors.compass}
                    />
                </TouchableOpacity>

                {showDetails && (
                    <View style={[styles.detailsBox, { backgroundColor: isDark ? '#2C1810' : '#FFFFFF', borderColor: activeColors.border }]}>
                        <Text style={[styles.detailsTitle, { color: activeColors.primary }]}>
                            {t('errors.boundaryErrorDetails') || 'Hata Detayları'}:
                        </Text>
                        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                            <Text style={[styles.detailsText, { color: activeColors.error }]}>
                                {error.name}: {error.message}
                            </Text>
                            {error.stack && (
                                <Text style={[styles.stackText, { color: activeColors.textMuted }]}>
                                    {error.stack}
                                </Text>
                            )}
                        </ScrollView>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    content: {
        width: '100%',
        alignItems: 'center',
        maxWidth: 340,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        position: 'relative',
    },
    icon: {
        transform: [{ rotate: '45deg' }], // Push direction error simulation
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
    title: {
        fontSize: 24,
        fontFamily: Fonts.heading,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: Fonts.body,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 22,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    buttonText: {
        fontSize: 16,
        fontFamily: Fonts.uiBold,
        fontWeight: 'bold',
    },
    detailsToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.lg,
        gap: Spacing.xs,
        padding: Spacing.sm,
    },
    detailsToggleText: {
        fontSize: 14,
        fontFamily: Fonts.ui,
    },
    detailsBox: {
        width: '100%',
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        marginTop: Spacing.md,
        padding: Spacing.md,
        maxHeight: 200,
    },
    detailsTitle: {
        fontSize: 14,
        fontFamily: Fonts.uiBold,
        fontWeight: 'bold',
        marginBottom: Spacing.xs,
    },
    scrollView: {
        flexGrow: 0,
    },
    scrollContent: {
        paddingBottom: Spacing.sm,
    },
    detailsText: {
        fontSize: 13,
        fontFamily: Fonts.mono,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    stackText: {
        fontSize: 11,
        fontFamily: Fonts.mono,
        lineHeight: 16,
    },
});
