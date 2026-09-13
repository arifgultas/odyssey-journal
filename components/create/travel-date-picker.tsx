import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { CALENDAR_MONTH_NAMES, SHORT_WEEKDAYS_MON_FIRST, formatPolaroidDate } from '@/lib/date-formatter';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { mirrorIcon } from '@/lib/rtl';

interface TravelDatePickerProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    theme: {
        background: string;
        paper: string;
        primary: string;
        accentBrown: string;
        textMain: string;
        textSub: string;
        line: string;
        border: string;
    };
    isDark: boolean;
    isModalOpen?: boolean;
    onOpenModal?: () => void;
    onCloseModal?: () => void;
}

export function TravelDatePicker({
    selectedDate,
    onDateChange,
    theme,
    isDark,
    isModalOpen,
    onOpenModal,
    onCloseModal,
}: TravelDatePickerProps) {
    const { t, language } = useLanguage();

    // Internal modal state if uncontrolled
    const [internalModalOpen, setInternalModalOpen] = useState(false);
    const modalVisible = isModalOpen !== undefined ? isModalOpen : internalModalOpen;

    const setModalVisible = (visible: boolean) => {
        if (visible) {
            onOpenModal?.();
        } else {
            onCloseModal?.();
        }
        setInternalModalOpen(visible);
    };

    // Calendar navigation state
    const [viewingYear, setViewingYear] = useState(selectedDate.getFullYear());
    const [viewingMonth, setViewingMonth] = useState(selectedDate.getMonth()); // 0-11
    const [tempSelectedDate, setTempSelectedDate] = useState<Date>(selectedDate);

    // Sync temp state when opening
    const handleOpen = () => {
        setTempSelectedDate(new Date(selectedDate));
        setViewingYear(selectedDate.getFullYear());
        setViewingMonth(selectedDate.getMonth());
        setModalVisible(true);
    };

    // Format relative label (Today, Yesterday, 3 days ago, etc.)
    const getRelativeLabel = (date: Date): string => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const target = new Date(date);
        target.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - target.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return t('datePicker.today');
        }
        if (diffDays === 1) {
            return t('datePicker.yesterday');
        }
        if (diffDays === -1) {
            return t('datePicker.tomorrow');
        }
        if (diffDays > 1) {
            return `${diffDays} ${t('datePicker.daysAgo')}`;
        }
        return `${Math.abs(diffDays)} ${t('datePicker.daysLater')}`;
    };

    // Formatted date string for display
    const formattedMainDate = useMemo(() => {
        return formatPolaroidDate(selectedDate, language);
    }, [selectedDate, language]);

    // Quick selection handler
    const handleQuickSelect = (daysAgo: number) => {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        d.setHours(12, 0, 0, 0);
        onDateChange(d);
    };

    // Is a quick chip currently active?
    const isChipActive = (daysAgo: number) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const target = new Date(selectedDate);
        target.setHours(0, 0, 0, 0);

        const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays === daysAgo;
    };

    // Calendar calculations
    const daysInMonth = useMemo(() => {
        return new Date(viewingYear, viewingMonth + 1, 0).getDate();
    }, [viewingYear, viewingMonth]);

    // First day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = useMemo(() => {
        const day = new Date(viewingYear, viewingMonth, 1).getDay();
        // Convert to Monday = 0, Sunday = 6
        return day === 0 ? 6 : day - 1;
    }, [viewingYear, viewingMonth]);

    const langKey = (language || 'en').toLowerCase().split('-')[0];
    const monthNames = CALENDAR_MONTH_NAMES[langKey] || CALENDAR_MONTH_NAMES.en;
    const weekDayNames = SHORT_WEEKDAYS_MON_FIRST[langKey] || SHORT_WEEKDAYS_MON_FIRST.en;

    const handlePrevMonth = () => {
        if (viewingMonth === 0) {
            setViewingMonth(11);
            setViewingYear((prev) => prev - 1);
        } else {
            setViewingMonth((prev) => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewingMonth === 11) {
            setViewingMonth(0);
            setViewingYear((prev) => prev + 1);
        } else {
            setViewingMonth((prev) => prev + 1);
        }
    };

    const handleSelectDay = (day: number) => {
        const newDate = new Date(viewingYear, viewingMonth, day, 12, 0, 0);
        setTempSelectedDate(newDate);
    };

    const handleConfirmModal = () => {
        onDateChange(tempSelectedDate);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.sectionLabel, { color: theme.textSub }]}>
                    {t('datePicker.title')}
                </Text>
                <View style={[styles.badge, { backgroundColor: `${theme.primary}25` }]}>
                    <Text style={[styles.badgeText, { color: isDark ? theme.primary : '#2C1810' }]}>
                        {getRelativeLabel(selectedDate)}
                    </Text>
                </View>
            </View>

            {/* Main Interactive Date Card */}
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        backgroundColor: isDark ? theme.paper : '#FFFFFF',
                        borderColor: theme.border,
                    },
                ]}
                onPress={handleOpen}
                activeOpacity={0.85}
            >
                <View style={[styles.iconWrapper, { backgroundColor: `${theme.primary}20`, borderColor: `${theme.primary}40` }]}>
                    <Ionicons name="calendar" size={22} color={theme.primary} />
                </View>

                <View style={styles.dateInfo}>
                    <Text style={[styles.mainDateText, { color: isDark ? theme.textMain : '#2C1810' }]}>
                        {formattedMainDate}
                    </Text>
                    <Text style={[styles.dateSubText, { color: theme.accentBrown }]}>
                        {t('datePicker.tapToChange')}
                    </Text>
                </View>

                <View style={[styles.changeButton, { borderColor: `${theme.accentBrown}40` }]}>
                    <Ionicons name="create-outline" size={16} color={theme.accentBrown} />
                    <Text style={[styles.changeButtonText, { color: theme.accentBrown }]}>
                        {t('datePicker.change')}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Quick Preset Chips */}
            <View style={styles.quickChipsContainer}>
                <TouchableOpacity
                    style={[
                        styles.quickChip,
                        { borderColor: theme.border, backgroundColor: isDark ? theme.paper : '#FFFFFF' },
                        isChipActive(0) && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => handleQuickSelect(0)}
                    activeOpacity={0.8}
                >
                    <Text
                        style={[
                            styles.quickChipText,
                            { color: theme.textSub },
                            isChipActive(0) && { color: '#2C1810', fontFamily: Typography.fonts.uiBold },
                        ]}
                    >
                        {t('datePicker.today')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.quickChip,
                        { borderColor: theme.border, backgroundColor: isDark ? theme.paper : '#FFFFFF' },
                        isChipActive(1) && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => handleQuickSelect(1)}
                    activeOpacity={0.8}
                >
                    <Text
                        style={[
                            styles.quickChipText,
                            { color: theme.textSub },
                            isChipActive(1) && { color: '#2C1810', fontFamily: Typography.fonts.uiBold },
                        ]}
                    >
                        {t('datePicker.yesterday')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.quickChip,
                        { borderColor: theme.border, backgroundColor: isDark ? theme.paper : '#FFFFFF' },
                        isChipActive(3) && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => handleQuickSelect(3)}
                    activeOpacity={0.8}
                >
                    <Text
                        style={[
                            styles.quickChipText,
                            { color: theme.textSub },
                            isChipActive(3) && { color: '#2C1810', fontFamily: Typography.fonts.uiBold },
                        ]}
                    >
                        {t('datePicker.threeDaysAgo')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.quickChip,
                        styles.customDateChip,
                        { borderColor: `${theme.accentBrown}60`, backgroundColor: 'transparent' },
                    ]}
                    onPress={handleOpen}
                    activeOpacity={0.8}
                >
                    <Ionicons name="calendar-outline" size={13} color={theme.accentBrown} style={{ marginEnd: 4 }} />
                    <Text style={[styles.quickChipText, { color: theme.accentBrown, fontFamily: Typography.fonts.uiBold }]}>
                        {t('datePicker.calendar')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Custom Vintage Calendar Modal */}
            <Modal
                visible={modalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    />

                    <View style={[styles.modalContent, { backgroundColor: isDark ? theme.background : '#FAF6EE', borderColor: theme.border }]}>
                        {/* Modal Header */}
                        <View style={[styles.modalHeader, { borderBottomColor: theme.line }]}>
                            <View style={styles.modalTitleRow}>
                                <Ionicons name="calendar" size={20} color={theme.primary} style={{ marginEnd: 8 }} />
                                <Text style={[styles.modalTitle, { color: isDark ? theme.textMain : '#2C1810' }]}>
                                    {t('datePicker.selectDate')}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.modalCloseBtn}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="close" size={22} color={theme.textSub} />
                            </TouchableOpacity>
                        </View>

                        {/* Month / Year Navigator */}
                        <View style={styles.monthNavigator}>
                            <TouchableOpacity
                                onPress={handlePrevMonth}
                                style={[styles.navArrow, { borderColor: theme.border }]}
                                activeOpacity={0.7}
                            >
                                <Ionicons name={mirrorIcon('chevron-back')} size={18} color={theme.textMain} />
                            </TouchableOpacity>

                            <Text style={[styles.monthYearText, { color: isDark ? theme.primary : '#2C1810' }]}>
                                {monthNames[viewingMonth]} {viewingYear}
                            </Text>

                            <TouchableOpacity
                                onPress={handleNextMonth}
                                style={[styles.navArrow, { borderColor: theme.border }]}
                                activeOpacity={0.7}
                            >
                                <Ionicons name={mirrorIcon('chevron-forward')} size={18} color={theme.textMain} />
                            </TouchableOpacity>
                        </View>

                        {/* Day of Week Headers */}
                        <View style={styles.weekDaysRow}>
                            {weekDayNames.map((dayName, idx) => (
                                <Text key={idx} style={[styles.weekDayHeader, { color: theme.textSub }]}>
                                    {dayName}
                                </Text>
                            ))}
                        </View>

                        {/* Calendar Grid */}
                        <View style={styles.calendarGrid}>
                            {/* Empty offset days */}
                            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                                <View key={`empty-${idx}`} style={styles.calendarDayCell} />
                            ))}

                            {/* Actual days */}
                            {Array.from({ length: daysInMonth }).map((_, idx) => {
                                const dayNum = idx + 1;
                                const isSelected =
                                    tempSelectedDate.getDate() === dayNum &&
                                    tempSelectedDate.getMonth() === viewingMonth &&
                                    tempSelectedDate.getFullYear() === viewingYear;

                                const today = new Date();
                                const isToday =
                                    today.getDate() === dayNum &&
                                    today.getMonth() === viewingMonth &&
                                    today.getFullYear() === viewingYear;

                                return (
                                    <TouchableOpacity
                                        key={`day-${dayNum}`}
                                        style={[
                                            styles.calendarDayCell,
                                            isSelected && [styles.selectedDayCell, { backgroundColor: theme.primary }],
                                            isToday && !isSelected && [styles.todayCell, { borderColor: theme.primary }],
                                        ]}
                                        onPress={() => handleSelectDay(dayNum)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.dayText,
                                                { color: theme.textMain },
                                                isSelected && { color: '#2C1810', fontFamily: Typography.fonts.uiBold },
                                                isToday && !isSelected && { color: theme.primary, fontFamily: Typography.fonts.uiBold },
                                            ]}
                                        >
                                            {dayNum}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Selected Date Preview & Action Buttons */}
                        <View style={[styles.modalFooter, { borderTopColor: theme.line }]}>
                            <View style={styles.modalPreviewInfo}>
                                <Text style={[styles.modalPreviewLabel, { color: theme.textSub }]}>
                                    {t('datePicker.selected')}
                                </Text>
                                <Text style={[styles.modalPreviewValue, { color: isDark ? theme.textMain : '#2C1810' }]}>
                                    {formatPolaroidDate(tempSelectedDate, language)} ({getRelativeLabel(tempSelectedDate)})
                                </Text>
                            </View>

                            <View style={styles.modalButtonsRow}>
                                <TouchableOpacity
                                    style={[styles.cancelBtn, { borderColor: theme.border }]}
                                    onPress={() => setModalVisible(false)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.cancelBtnText, { color: theme.textSub }]}>
                                        {t('datePicker.cancel')}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
                                    onPress={handleConfirmModal}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="checkmark" size={16} color="#2C1810" style={{ marginEnd: 4 }} />
                                    <Text style={styles.confirmBtnText}>
                                        {t('datePicker.apply')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: Spacing.lg,
        paddingHorizontal: Spacing.lg,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs + 2,
    },
    sectionLabel: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 11,
        letterSpacing: 2,
        paddingHorizontal: 4,
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    badge: {
        paddingHorizontal: Spacing.sm + 2,
        paddingVertical: 3,
        borderRadius: BorderRadius.sm,
    },
    badgeText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 11,
        letterSpacing: 0.5,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        marginEnd: Spacing.md,
    },
    dateInfo: {
        flex: 1,
    },
    mainDateText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 15,
        marginBottom: 2,
    },
    dateSubText: {
        fontFamily: Typography.fonts.ui,
        fontSize: 12,
    },
    changeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm + 2,
        paddingVertical: 6,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        gap: 4,
    },
    changeButtonText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 12,
    },
    quickChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs + 4,
        marginTop: Spacing.sm,
    },
    quickChip: {
        paddingHorizontal: Spacing.md - 2,
        paddingVertical: 7,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    customDateChip: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quickChipText: {
        fontFamily: Typography.fonts.ui,
        fontSize: 12,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    modalContent: {
        width: '100%',
        maxWidth: 360,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        padding: Spacing.lg,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        marginBottom: Spacing.md,
    },
    modalTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalTitle: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 16,
    },
    modalCloseBtn: {
        padding: 4,
    },
    monthNavigator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    navArrow: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthYearText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 16,
    },
    weekDaysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
        paddingHorizontal: 4,
    },
    weekDayHeader: {
        width: 38,
        textAlign: 'center',
        fontFamily: Typography.fonts.uiBold,
        fontSize: 11,
        letterSpacing: 0.5,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    calendarDayCell: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 2,
        borderRadius: 20,
    },
    selectedDayCell: {
        borderRadius: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    todayCell: {
        borderWidth: 1.5,
        borderRadius: 20,
    },
    dayText: {
        fontFamily: Typography.fonts.ui,
        fontSize: 14,
    },
    modalFooter: {
        borderTopWidth: 1,
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
    },
    modalPreviewInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    modalPreviewLabel: {
        fontFamily: Typography.fonts.ui,
        fontSize: 12,
    },
    modalPreviewValue: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 13,
    },
    modalButtonsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 14,
    },
    confirmBtn: {
        flex: 1.5,
        flexDirection: 'row',
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmBtnText: {
        fontFamily: Typography.fonts.uiBold,
        fontSize: 14,
        color: '#2C1810',
    },
});
