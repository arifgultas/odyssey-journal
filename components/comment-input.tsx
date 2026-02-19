import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CommentInputProps {
    onSubmit: (content: string) => void;
    loading?: boolean;
    placeholder?: string;
}

export function CommentInput({
    onSubmit,
    loading = false,
    placeholder = 'Add a comment...'
}: CommentInputProps) {
    const [comment, setComment] = useState('');
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const handleSubmit = () => {
        if (comment.trim() && !loading) {
            onSubmit(comment.trim());
            setComment('');
        }
    };

    const canSubmit = comment.trim().length > 0 && !loading;

    return (
        <View style={[styles.container, {
            paddingBottom: Math.max(insets.bottom, Spacing.lg),
            backgroundColor: theme.surface,
            borderTopColor: theme.accent,
        }]}>
            <TextInput
                style={[styles.input, {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text,
                }]}
                placeholder={placeholder}
                placeholderTextColor={theme.textMuted}
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={500}
                editable={!loading}
                onSubmitEditing={handleSubmit}
                blurOnSubmit={false}
            />
            <TouchableOpacity
                style={[
                    styles.sendButton,
                    { backgroundColor: theme.border, borderColor: theme.border },
                    canSubmit && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
                onPress={handleSubmit}
                disabled={!canSubmit}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={theme.surface} />
                ) : (
                    <Ionicons
                        name="send"
                        size={20}
                        color={canSubmit ? theme.surface : theme.textMuted}
                    />
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: Spacing.md,
        padding: Spacing.lg,
        borderTopWidth: 2,
        shadowColor: '#2C1810',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    input: {
        flex: 1,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        fontFamily: Typography.fonts.body,
        fontSize: 15,
        maxHeight: 100,
        minHeight: 44,
        lineHeight: 22,
        shadowColor: '#2C1810',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
});
