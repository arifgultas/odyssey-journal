import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchHistoryProps {
    searchHistory: any[] | undefined;
    vintageTheme: any;
    t: (key: string) => string;
    onItemPress: (query: string) => void;
    onDeleteItem: (id: string) => void;
}

export function SearchHistory({
    searchHistory,
    vintageTheme,
    t,
    onItemPress,
    onDeleteItem,
}: SearchHistoryProps) {
    if (!searchHistory || searchHistory.length === 0) return null;

    return (
        <View style={[styles.historyContainer, { backgroundColor: vintageTheme.background }]}>
            <Text style={[styles.historyTitle, { color: vintageTheme.text }]}>{t('explore.recentSearches')}</Text>
            {searchHistory.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    style={[styles.historyItem, { borderBottomColor: vintageTheme.border }]}
                    onPress={() => onItemPress(item.query)}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.query}, son aramayı tekrar arat`}
                >
                    <Ionicons name="time-outline" size={18} color={vintageTheme.textMuted} />
                    <Text style={[styles.historyText, { color: vintageTheme.text }]}>{item.query}</Text>
                    <TouchableOpacity
                        onPress={() => onDeleteItem(item.id)}
                        accessibilityRole="button"
                        accessibilityLabel="Arama geçmişinden sil"
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
    historyTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
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
        marginLeft: 12,
    },
});
