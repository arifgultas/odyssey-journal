import { Colors, Shadows, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Boarding Pass Theme Colors
const BoardingPassColors = {
    light: {
        cardBg: '#fdfbf7',
        headerBg: '#faf6ef',
        text: '#2c241b',
        textMuted: '#8c7b6d',
        gold: '#8B6914',
        goldBorder: '#C8A96E',
        dashedLine: '#c4b59e',
        statBg: '#3E2723',
        statText: '#d4aa73',
        statLabel: '#b89e7a',
        divider: '#5a3e2e',
    },
    dark: {
        cardBg: '#2a241e',
        headerBg: '#251f19',
        text: '#F5F1E8',
        textMuted: '#b9ab9d',
        gold: '#d4aa73',
        goldBorder: '#a88a5a',
        dashedLine: '#4a3d2f',
        statBg: '#1a1410',
        statText: '#d4aa73',
        statLabel: '#8c7b6d',
        divider: '#3d3228',
    },
};

interface BoardingPassCardProps {
    avatarUrl: string | null;
    fullName: string;
    username: string;
    bio: string | null;
    countriesVisited: number;
    totalDistanceKm: number;
    travelDays: number;
    /** Translation function — expects keys like 'profile.countries' */
    t: (key: string) => string;
}

/**
 * Boarding Pass card for profile screens.
 * Displays user identity + travel stats in an airline boarding-pass layout.
 */
export function BoardingPassCard({
    avatarUrl,
    fullName,
    username,
    bio,
    countriesVisited,
    totalDistanceKm,
    travelDays,
    t,
}: BoardingPassCardProps) {
    const colorScheme = useColorScheme();
    const theme = BoardingPassColors[colorScheme ?? 'light'];

    const formatDistance = (km: number): string => {
        if (km >= 1000) return `${(km / 1000).toFixed(1)}k`;
        return km.toString();
    };

    return (
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
            {/* ── Header: Odyssey Journal ── */}
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <Text style={[styles.headerText, { color: theme.text }]}>
                    Boarding Pass
                </Text>
            </View>

            {/* ── Dashed separator ── */}
            <View style={styles.dashedRow}>
                <View style={[styles.dashedLine, { borderColor: theme.dashedLine }]} />
            </View>

            {/* ── Profile Info Row ── */}
            <View style={styles.profileRow}>
                {/* Avatar */}
                <View style={[styles.avatarRing, { borderColor: theme.goldBorder }]}>
                    {avatarUrl ? (
                        <Image
                            source={{ uri: avatarUrl }}
                            style={styles.avatarImage}
                            contentFit="cover"
                        />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.headerBg }]}>
                            <Ionicons name="person" size={36} color={theme.textMuted} />
                        </View>
                    )}
                </View>

                {/* Leather Binding Strip */}
                <View style={[styles.leatherStrip, { backgroundColor: theme.statBg }]}>
                    <Ionicons name="airplane" size={12} color="#FFFFFF" style={{ opacity: 0.7, transform: [{ rotate: '-90deg' }] }} />
                </View>

                {/* Name / Username / Bio */}
                <View style={styles.infoColumn}>
                    <Text style={[styles.fullName, { color: theme.text }]} numberOfLines={1}>
                        {fullName}
                    </Text>
                    <Text style={[styles.username, { color: theme.textMuted }]} numberOfLines={1}>
                        @{username}
                    </Text>
                    {bio ? (
                        <Text style={[styles.bio, { color: theme.textMuted }]} numberOfLines={2}>
                            {bio}
                        </Text>
                    ) : null}
                </View>
            </View>

            {/* ── Airplane Divider ── */}
            <View style={styles.airplaneDivider}>
                <View style={[styles.dashedLineFlex, { borderColor: theme.dashedLine }]} />
                <Ionicons name="airplane" size={20} color={theme.textMuted} style={styles.airplaneIcon} />
                <View style={[styles.dashedLineFlex, { borderColor: theme.dashedLine }]} />
            </View>

            {/* ── Stats Bar ── */}
            <View style={[styles.statsBar, { backgroundColor: theme.statBg }]}>
                {/* Countries */}
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.statLabel }]}>
                        {t('profile.countries')}
                    </Text>
                    <Text style={[styles.statValue, { color: theme.statText }]}>
                        ({countriesVisited})
                    </Text>
                </View>

                {/* Divider */}
                <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />

                {/* Kilometers */}
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.statLabel }]}>
                        {t('profile.kilometers')}
                    </Text>
                    <Text style={[styles.statValue, { color: theme.statText }]}>
                        ({formatDistance(totalDistanceKm)})
                    </Text>
                </View>

                {/* Divider */}
                <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />

                {/* Days */}
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.statLabel }]}>
                        {t('profile.days')}
                    </Text>
                    <Text style={[styles.statValue, { color: theme.statText }]}>
                        ({travelDays})
                    </Text>
                </View>
            </View>
        </View>
    );
}

/* ─── Styles ─── */
const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        ...Shadows.lg,
    },

    /* Header */
    header: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    headerText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 20,
        letterSpacing: 0.5,
    },

    /* Dashed separator */
    dashedRow: {
        paddingHorizontal: 12,
    },
    dashedLine: {
        borderBottomWidth: 1.5,
        borderStyle: 'dashed',
    },

    /* Profile Info */
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 14,
    },
    avatarRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 37,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 37,
        alignItems: 'center',
        justifyContent: 'center',
    },
    leatherStrip: {
        width: 18,
        height: 68,
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoColumn: {
        flex: 1,
        gap: 2,
    },
    fullName: {
        fontFamily: Typography.fonts.heading,
        fontSize: 22,
        letterSpacing: -0.3,
    },
    username: {
        fontFamily: Typography.fonts.ui,
        fontSize: 13,
        letterSpacing: 0.3,
    },
    bio: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
        lineHeight: 17,
        marginTop: 4,
    },

    /* Airplane Divider */
    airplaneDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingBottom: 10,
    },
    dashedLineFlex: {
        flex: 1,
        borderBottomWidth: 1.5,
        borderStyle: 'dashed',
    },
    airplaneIcon: {
        marginHorizontal: 8,
    },

    /* Stats Bar */
    statsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 14,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontFamily: Typography.fonts.ui,
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    statValue: {
        fontFamily: Typography.fonts.heading,
        fontSize: 18,
    },
    statDivider: {
        width: 1,
        height: 32,
    },
});
