import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: signOut
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>Odyssey</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text style={styles.email}>{user?.email}</Text>
                    <Text style={styles.subtitle}>Traveler</Text>
                </View>

                <View style={styles.stats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>0</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>0</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>0</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    logo: {
        fontFamily: Typography.fonts.heading,
        fontSize: 24,
        color: Colors.light.primary,
        letterSpacing: -0.5,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xxl,
    },
    userInfo: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.light.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    avatarText: {
        fontFamily: Typography.fonts.heading,
        fontSize: 40,
        color: Colors.light.surface,
    },
    email: {
        fontFamily: Typography.fonts.body,
        fontSize: 18,
        color: Colors.light.text,
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.textSecondary,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: Spacing.xl,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.light.border,
        marginBottom: Spacing.xxl,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontFamily: Typography.fonts.heading,
        fontSize: 24,
        color: Colors.light.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.textSecondary,
    },
    logoutButton: {
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.primary,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    logoutText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        color: Colors.light.primary,
    },
});
