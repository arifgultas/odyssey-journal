import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchHistoryProps {
    searchHistory: any[] | undefined;
    vintageTheme: any;
    t: (key: string) => string;
    onItemPress: (query: string) => void;
    onDeleteItem: (id: string) => void;
    onClearAll?: () => void;
}

export function SearchHistory({
    searchHistory,
    vintageTheme,
    t,
    onItemPress,
    onDeleteItem,
    onClearAll,
}: SearchHistoryProps) {
    if (!searchHistory || searchHistory.length === 0) return null;

    return (
        <View style={[styles.historyContainer, { backgroundColor: vintageTheme.background }]}>
            <View style={styles.historyHeader}>
                <Text style={[styles.historyTitle, { color: vintageTheme.text }]}>{t('explore.recentSearches')}</Text>
                {onClearAll && (
                    <TouchableOpacity onPress={onClearAll} accessibilityRole="button" hitSlop={8}>
                        <Text style={[styles.clearAll, { color: vintageTheme.textMuted }]}>{t('explore.clearHistory')}</Text>
                    </TouchableOpacity>
                )}
            </View>
            {searchHistory.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    style={[styles.historyItem, { borderBottomColor: vintageTheme.border }]}
                    onPress={() => onItemPress(item.query)}
                    accessibilityRole="button"
                    accessibilityLabel={item.query}
                >
                    <Ionicons name="time-outline" size={18} color={vintageTheme.textMuted} />
                    <Text style={[styles.historyText, { color: vintageTheme.text }]}>{item.query}</Text>
                    <TouchableOpacity
                        onPress={() => onDeleteItem(item.id)}
                        accessibilityRole="button"
                        accessibilityLabel={t('common.delete')}
                    >
                        <Ionicons name="close" size={18} color={vintageTheme.textMuted} />
                    </TouchableOpacity>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    historyContainer: {
        padding: 20,
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    clearAll: {
        fontSize: 14,
        fontWeight: '600',
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    historyText: {
        flex: 1,
        fontSize: 15,
        marginStart: 12,
    },
});
