import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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

    const handleSubmit = () => {
        if (comment.trim() && !loading) {
            onSubmit(comment.trim());
            setComment('');
        }
    };

    const canSubmit = comment.trim().length > 0 && !loading;

    return (
        <View style={styles.container}>
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
        gap: Spacing.sm,
        padding: Spacing.md,
        backgroundColor: Colors.light.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.text,
        maxHeight: 100,
        minHeight: 40,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.light.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonActive: {
        backgroundColor: Colors.light.accent,
    },
});
