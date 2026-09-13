/**
 * Per-language country abbreviations.
 *
 * There is no international standard for abbreviating a country name *in a language*.
 * Turkish, Japanese and Chinese each have a real, established convention (İspanya -> İS,
 * スペイン -> 西, 西班牙 -> 西); Spanish, French, German, Portuguese and Italian have none
 * and use the ISO 3166-1 alpha-2 code instead.
 *
 * So this file only lists abbreviations that genuinely exist. Anything not listed falls
 * back to the ISO code, and no abbreviation is ever invented to fill a gap.
 *
 * Keys are ISO 3166-1 alpha-2 codes.
 */
import type { LanguageCode } from '../index';

/**
 * Turkish abbreviations, as used on the cards before this file existed.
 * Mostly the first letters of the Turkish country name (İspanya -> İS, Almanya -> AL),
 * with a few established acronyms (ABD, BAE) and İNG for the United Kingdom.
 */
const TR_ABBREVIATIONS: Record<string, string> = {
    US: 'ABD',
    GB: 'İNG',
    DE: 'AL',
    ES: 'İS',
    IT: 'İT',
    GR: 'YU',
    AT: 'AVU',
    NL: 'HOL',
    CH: 'İSV',
    SE: 'İSVE',
    AE: 'BAE',
    EG: 'MIS',
    CZ: 'ÇEK',
    HU: 'MAC',
    PL: 'POL',
    HR: 'HIR',
    DK: 'DAN',
    BE: 'BEL',
    PT: 'PO',
    JP: 'JA',
};

/**
 * Japanese single-kanji country abbreviations (国名の漢字略称), the set still in everyday
 * use in headlines and compounds (日米関係, 独仏).
 *
 * Deliberately conservative: only unambiguous characters are listed. 瑞 is Switzerland and
 * 典 is Sweden, which are easy to confuse, and characters such as 墺 / 羅 are archaic enough
 * that they would read as noise - those countries fall back to their ISO code.
 */
const JA_ABBREVIATIONS: Record<string, string> = {
    US: '米',
    GB: '英',
    DE: '独',
    FR: '仏',
    IT: '伊',
    ES: '西',
    RU: '露',
    CN: '中',
    KR: '韓',
    JP: '日',
    CA: '加',
    AU: '豪',
    IN: '印',
    BR: '伯',
    MX: '墨',
    NL: '蘭',
    BE: '白',
    CH: '瑞',
    SE: '典',
    TR: '土',
    GR: '希',
    PT: '葡',
    EG: '埃',
    DK: '丁',
    NO: '諾',
    FI: '芬',
    PL: '波',
    HU: '洪',
};

/**
 * Chinese single-character abbreviations (国家简称), the first character of the Chinese
 * country name where that character is unambiguous.
 *
 * Switzerland (瑞士) and Sweden (瑞典) both start with 瑞, and Brazil (巴西) collides with
 * Pakistan (巴基斯坦), so those are left to the ISO code rather than guessed at.
 */
const ZH_ABBREVIATIONS: Record<string, string> = {
    US: '美',
    GB: '英',
    DE: '德',
    FR: '法',
    IT: '意',
    ES: '西',
    RU: '俄',
    CN: '中',
    KR: '韩',
    JP: '日',
    CA: '加',
    AU: '澳',
    IN: '印',
    NL: '荷',
    BE: '比',
    TR: '土',
    GR: '希',
    PT: '葡',
    AT: '奥',
    EG: '埃',
    MX: '墨',
    TH: '泰',
    VN: '越',
    RO: '罗',
    HU: '匈',
    PL: '波',
    CZ: '捷',
    DK: '丹',
    NO: '挪',
    FI: '芬',
};

const BY_LANGUAGE: Partial<Record<LanguageCode, Record<string, string>>> = {
    tr: TR_ABBREVIATIONS,
    ja: JA_ABBREVIATIONS,
    zh: ZH_ABBREVIATIONS,
};

/**
 * Codes shown differently from their raw ISO value in languages without their own
 * abbreviation. "UK" is what readers everywhere recognise for GB, and it is what the
 * cards showed before; ISO's "GB" stays the canonical internal value.
 */
const DISPLAY_OVERRIDES: Record<string, string> = {
    GB: 'UK',
};

/**
 * The abbreviation to print for a country, given the viewer's language.
 * Falls back to the ISO 3166-1 alpha-2 code, which is the correct answer for every
 * language that has no abbreviation convention of its own.
 */
export function getCountryAbbreviation(isoCode: string, language: LanguageCode | string): string {
    const code = (isoCode || '').toUpperCase();
    if (!code) return '';

    const lang = String(language || 'en').toLowerCase().split('-')[0] as LanguageCode;
    const table = BY_LANGUAGE[lang];
    if (table && table[code]) return table[code];

    return DISPLAY_OVERRIDES[code] || code;
}

/** Every abbreviation a language might display, so they can be parsed back into ISO codes */
export function getAbbreviationsByLanguage(): Partial<Record<LanguageCode, Record<string, string>>> {
    return BY_LANGUAGE;
}

export { DISPLAY_OVERRIDES, JA_ABBREVIATIONS, TR_ABBREVIATIONS, ZH_ABBREVIATIONS };
