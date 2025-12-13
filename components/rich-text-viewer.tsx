import { Colors, Spacing, Typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RichTextViewerProps {
    content: string;
    style?: any;
}

/**
 * RichTextViewer Component
 * 
 * Displays formatted text with basic markdown-style support.
 * Supports:
 * - **Bold** text
 * - *Italic* text
 * - Line breaks
 * - Paragraphs
 * 
 * For full markdown support, consider using react-native-markdown-display
 */
export function RichTextViewer({ content, style }: RichTextViewerProps) {
    // Simple markdown parsing for bold and italic
    const parseContent = (text: string) => {
        const parts: Array<{ text: string; bold?: boolean; italic?: boolean }> = [];
        let currentText = '';
        let i = 0;

        while (i < text.length) {
            // Check for **bold**
            if (text.substr(i, 2) === '**') {
                if (currentText) {
                    parts.push({ text: currentText });
                    currentText = '';
                }
                i += 2;
                let boldText = '';
                while (i < text.length && text.substr(i, 2) !== '**') {
                    boldText += text[i];
                    i++;
                }
                if (boldText) {
                    parts.push({ text: boldText, bold: true });
                }
                i += 2;
            }
            // Check for *italic*
            else if (text[i] === '*' && text[i + 1] !== '*') {
                if (currentText) {
                    parts.push({ text: currentText });
                    currentText = '';
                }
                i++;
                let italicText = '';
                while (i < text.length && text[i] !== '*') {
                    italicText += text[i];
                    i++;
                }
                if (italicText) {
                    parts.push({ text: italicText, italic: true });
                }
                i++;
            } else {
                currentText += text[i];
                i++;
            }
        }

        if (currentText) {
            parts.push({ text: currentText });
        }

        return parts;
    };

    const renderParagraph = (paragraph: string, index: number) => {
        const parts = parseContent(paragraph);

        return (
            <Text key={index} style={[styles.paragraph, style]}>
                {parts.map((part, partIndex) => (
                    <Text
                        key={partIndex}
                        style={[
                            styles.text,
                            part.bold && styles.bold,
                            part.italic && styles.italic,
                        ]}
                    >
                        {part.text}
                    </Text>
                ))}
            </Text>
        );
    };

    // Split content into paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());

    return (
        <View style={styles.container}>
            {paragraphs.map((paragraph, index) => renderParagraph(paragraph, index))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: Spacing.md,
    },
    paragraph: {
        marginBottom: Spacing.sm,
    },
    text: {
        fontFamily: Typography.fonts.body,
        fontSize: 16,
        color: Colors.light.text,
        lineHeight: 26,
    },
    bold: {
        fontFamily: Typography.fonts.bodyBold,
        fontWeight: '600',
    },
    italic: {
        fontFamily: Typography.fonts.bodyItalic,
        fontStyle: 'italic',
    },
});
