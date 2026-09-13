/**
 * Localized Date Formatter Utility
 * Provides deterministic, zero-dependency date and time formatting
 * for all 12 supported languages in Odyssey Journal:
 * tr, en, es, fr, de, pt, it, ru, ja, ko, zh, ar.
 *
 * Does not rely on Hermes ICU implementation which may fail to localize on some devices.
 */

import { t } from './i18n';

export const MONTH_NAMES: Record<string, string[]> = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    it: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
    es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    pt: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
    ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};

export const WEEKDAY_NAMES: Record<string, string[]> = {
    // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    tr: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
    it: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
    es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    pt: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
    ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    ja: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
    ko: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
};

export const CALENDAR_MONTH_NAMES: Record<string, string[]> = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
    es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};

export const SHORT_WEEKDAYS_MON_FIRST: Record<string, string[]> = {
    // 0 = Monday ... 6 = Sunday
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tr: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    it: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
    es: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    fr: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    pt: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    ja: ['月', '火', '水', '木', '金', '土', '日'],
    ko: ['월', '화', '수', '목', '금', '토', '일'],
    zh: ['一', '二', '三', '四', '五', '六', '日'],
    ar: ['إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت', 'أحد'],
};

function parseDate(dateInput?: string | Date | number | null): Date {
    if (!dateInput) return new Date();
    if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? new Date() : dateInput;
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Formats a date for the Polaroid card caption:
 * - English: "June 8, 2026"
 * - Italian: "8 giugno 2026"
 * - Turkish: "8 Haziran 2026"
 * - Spanish: "8 de junio de 2026"
 * - French: "8 juin 2026"
 * - German: "8. Juni 2026"
 * - Portuguese: "8 de junho de 2026"
 * - Russian: "8 июня 2026 г."
 * - Japanese / Chinese: "2026年6月8日"
 * - Korean: "2026년 6월 8일"
 * - Arabic: "8 يونيو 2026"
 */
export function formatPolaroidDate(dateInput?: string | Date | number | null, language: string = 'en'): string {
    const d = parseDate(dateInput);
    const lang = (language || 'en').toLowerCase().split('-')[0];

    const day = d.getDate();
    const monthIndex = d.getMonth();
    const year = d.getFullYear();

    const months = MONTH_NAMES[lang] || MONTH_NAMES.en;
    const month = months[monthIndex];

    switch (lang) {
        case 'en':
            return `${month} ${day}, ${year}`;
        case 'it':
            return `${day} ${month} ${year}`;
        case 'tr':
            return `${day} ${month} ${year}`;
        case 'es':
            return `${day} de ${month} de ${year}`;
        case 'fr':
            return `${day} ${month} ${year}`;
        case 'de':
            return `${day}. ${month} ${year}`;
        case 'pt':
            return `${day} de ${month} de ${year}`;
        case 'ru':
            return `${day} ${month} ${year} г.`;
        case 'ja':
        case 'zh':
            return `${year}年${monthIndex + 1}月${day}日`;
        case 'ko':
            return `${year}년 ${monthIndex + 1}월 ${day}일`;
        case 'ar':
            return `${day} ${month} ${year}`;
        default:
            return `${day} ${month} ${year}`;
    }
}

/**
 * Formats full date for the Post Detail screen (same as Polaroid date or locale standard)
 */
export function formatPostDetailDate(dateInput?: string | Date | number | null, language: string = 'en'): string {
    return formatPolaroidDate(dateInput, language);
}

/**
 * Formats day of the week for the Post Detail screen:
 * - Italian: "Lunedì"
 * - Turkish: "Pazartesi"
 * - English: "Monday"
 * - Spanish: "Lunes"
 * - German: "Montag"
 * - etc.
 */
export function formatPostDetailDay(dateInput?: string | Date | number | null, language: string = 'en'): string {
    const d = parseDate(dateInput);
    const lang = (language || 'en').toLowerCase().split('-')[0];

    const dayIndex = d.getDay();
    const weekdays = WEEKDAY_NAMES[lang] || WEEKDAY_NAMES.en;
    return weekdays[dayIndex];
}

/**
 * Formats a short date without the year, used for comment and notification timestamps:
 * - English: "June 8"      - Turkish: "8 Haziran"
 * - Japanese / Chinese: "6月8日"   - Korean: "6월 8일"
 */
export function formatShortDate(dateInput?: string | Date | number | null, language: string = 'en'): string {
    const d = parseDate(dateInput);
    const lang = (language || 'en').toLowerCase().split('-')[0];

    const day = d.getDate();
    const monthIndex = d.getMonth();
    const month = (MONTH_NAMES[lang] || MONTH_NAMES.en)[monthIndex];

    switch (lang) {
        case 'en':
            return `${month} ${day}`;
        case 'es':
        case 'pt':
            return `${day} de ${month}`;
        case 'de':
            return `${day}. ${month}`;
        case 'ja':
        case 'zh':
            return `${monthIndex + 1}月${day}日`;
        case 'ko':
            return `${monthIndex + 1}월 ${day}일`;
        default:
            return `${day} ${month}`;
    }
}

/**
 * Formats a 24-hour clock time ("09:41"). Deliberately deterministic rather than using
 * toLocaleTimeString, which silently falls back to English on Hermes builds without ICU.
 */
export function formatTime(dateInput?: string | Date | number | null): string {
    const d = parseDate(dateInput);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Short weekday name ("Mon", "Pzt", "月"), Sunday-indexed like Date.getDay()
 */
export function formatShortWeekday(dateInput?: string | Date | number | null, language: string = 'en'): string {
    const d = parseDate(dateInput);
    const lang = (language || 'en').toLowerCase().split('-')[0];
    const table = SHORT_WEEKDAYS_MON_FIRST[lang] || SHORT_WEEKDAYS_MON_FIRST.en;
    // The table starts on Monday, Date.getDay() starts on Sunday
    const index = (d.getDay() + 6) % 7;
    return table[index];
}

/**
 * Relative time ("Now", "5 minutes ago", "3 days ago"), falling back to a short date
 * once the difference passes a week. Uses the `time.*` translation keys.
 */
export function formatRelativeTime(dateInput?: string | Date | number | null, language: string = 'en'): string {
    const d = parseDate(dateInput);
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

    if (seconds < 60) return t('time.now');

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t(minutes === 1 ? 'time.minuteAgo' : 'time.minutesAgo', { count: minutes });

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t(hours === 1 ? 'time.hourAgo' : 'time.hoursAgo', { count: hours });

    const days = Math.floor(hours / 24);
    if (days === 1) return t('time.yesterday');
    if (days < 7) return t('time.daysAgo', { count: days });

    return formatShortDate(d, language);
}
