import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { REPORT_REASONS, reportPost, ReportReason } from '@/lib/reports';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ReportModalProps {
    visible: boolean;
    postId: string;
    onClose: () => void;
    onReported?: () => void;
}

export function ReportModal({ visible, postId, onClose, onReported }: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedReason) return;

        setIsSubmitting(true);
        try {
            await reportPost({
                post_id: postId,
                reason: selectedReason,
                description: description.trim() || undefined,
            });

            onReported?.();
            handleClose();
        } catch (error) {
            console.error('Error submitting report:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedReason(null);
        setDescription('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Report Post</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={Colors.light.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                        <Text style={styles.subtitle}>Why are you reporting this post?</Text>

                        {/* Reason Options */}
                        <View style={styles.reasonsContainer}>
                            {REPORT_REASONS.map((reason) => (
                                <TouchableOpacity
                                    key={reason.value}
                                    style={[
                                        styles.reasonOption,
                                        selectedReason === reason.value && styles.reasonOptionSelected,
                                    ]}
                                    onPress={() => setSelectedReason(reason.value)}
                                >
                                    <View style={styles.reasonContent}>
                                        <Text style={[
                                            styles.reasonLabel,
                                            selectedReason === reason.value && styles.reasonLabelSelected,
                                        ]}>
                                            {reason.label}
                                        </Text>
                                        <Text style={styles.reasonDescription}>
                                            {reason.description}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.radio,
                                        selectedReason === reason.value && styles.radioSelected,
                                    ]}>
                                        {selectedReason === reason.value && (
                                            <View style={styles.radioDot} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Additional Details */}
                        {selectedReason && (
                            <View style={styles.descriptionContainer}>
                                <Text style={styles.descriptionLabel}>
                                    Additional details (optional)
                                </Text>
                                <TextInput
                                    style={styles.descriptionInput}
                                    placeholder="Provide more context..."
                                    placeholderTextColor={Colors.light.textMuted}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    maxLength={500}
                                    textAlignVertical="top"
                                />
                                <Text style={styles.charCount}>
                                    {description.length}/500
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!selectedReason || isSubmitting) && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={!selectedReason || isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color={Colors.light.surface} />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit Report</Text>
                            )}
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
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: Colors.light.surface,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: 20,
        color: Colors.light.text,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    content: {
        padding: Spacing.lg,
    },
    contentContainer: {
        paddingBottom: 48,
    },
    subtitle: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        color: Colors.light.text,
        marginBottom: Spacing.md,
    },
    reasonsContainer: {
        gap: Spacing.sm,
    },
    reasonOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.md,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    reasonOptionSelected: {
        borderColor: Colors.light.accent,
        backgroundColor: Colors.light.surface,
    },
    reasonContent: {
        flex: 1,
        gap: 4,
    },
    reasonLabel: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 15,
        color: Colors.light.text,
    },
    reasonLabelSelected: {
        color: Colors.light.accent,
    },
    reasonDescription: {
        fontFamily: Typography.fonts.body,
        fontSize: 13,
        color: Colors.light.textSecondary,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.light.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: Spacing.sm,
    },
    radioSelected: {
        borderColor: Colors.light.accent,
    },
    radioDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.light.accent,
    },
    descriptionContainer: {
        marginTop: Spacing.lg,
    },
    descriptionLabel: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 14,
        color: Colors.light.text,
        marginBottom: Spacing.sm,
    },
    descriptionInput: {
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontFamily: Typography.fonts.body,
        fontSize: 14,
        color: Colors.light.text,
        minHeight: 100,
        maxHeight: 150,
    },
    charCount: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
        color: Colors.light.textMuted,
        textAlign: 'right',
        marginTop: Spacing.xs,
    },
    footer: {
        flexDirection: 'row',
        gap: Spacing.md,
        padding: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
    },
    cancelButton: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        color: Colors.light.text,
    },
    submitButton: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.light.error,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: Colors.light.border,
    },
    submitButtonText: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 16,
        color: Colors.light.surface,
    },
});
