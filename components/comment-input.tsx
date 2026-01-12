import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
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

    const handleSubmit = () => {
        if (comment.trim() && !loading) {
            onSubmit(comment.trim());
            setComment('');
        }
    };

    const canSubmit = comment.trim().length > 0 && !loading;

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={Colors.light.textMuted}
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
                    canSubmit && styles.sendButtonActive,
                ]}
                onPress={handleSubmit}
                disabled={!canSubmit}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={Colors.light.surface} />
                ) : (
                    <Ionicons
                        name="send"
                        size={20}
                        color={canSubmit ? Colors.light.surface : Colors.light.textMuted}
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
        backgroundColor: Colors.light.surface,
        borderTopWidth: 2,
        borderTopColor: Colors.light.accent,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.light.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        fontFamily: Typography.fonts.body,
        fontSize: 15,
        color: Colors.light.text,
        maxHeight: 100,
        minHeight: 44,
        lineHeight: 22,
        // Paper-like texture
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.light.border,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    sendButtonActive: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
});
