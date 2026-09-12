import {
    formatPolaroidDate,
    formatPostDetailDate,
    formatPostDetailDay,
} from '../date-formatter';

describe('date-formatter utility', () => {
    // 2026-06-08 is a Monday
    const testDate = '2026-06-08T12:00:00Z';

    describe('formatPolaroidDate across all supported languages', () => {
        it('formats in Italian (it)', () => {
            expect(formatPolaroidDate(testDate, 'it')).toBe('8 giugno 2026');
        });

        it('formats in English (en)', () => {
            expect(formatPolaroidDate(testDate, 'en')).toBe('June 8, 2026');
        });

        it('formats in Turkish (tr)', () => {
            expect(formatPolaroidDate(testDate, 'tr')).toBe('8 Haziran 2026');
        });

        it('formats in Spanish (es)', () => {
            expect(formatPolaroidDate(testDate, 'es')).toBe('8 de junio de 2026');
        });

        it('formats in French (fr)', () => {
            expect(formatPolaroidDate(testDate, 'fr')).toBe('8 juin 2026');
        });

        it('formats in German (de)', () => {
            expect(formatPolaroidDate(testDate, 'de')).toBe('8. Juni 2026');
        });

        it('formats in Portuguese (pt)', () => {
            expect(formatPolaroidDate(testDate, 'pt')).toBe('8 de junho de 2026');
        });

        it('formats in Russian (ru)', () => {
            expect(formatPolaroidDate(testDate, 'ru')).toBe('8 июня 2026 г.');
        });

        it('formats in Japanese (ja)', () => {
            expect(formatPolaroidDate(testDate, 'ja')).toBe('2026年6月8日');
        });

        it('formats in Korean (ko)', () => {
            expect(formatPolaroidDate(testDate, 'ko')).toBe('2026년 6월 8일');
        });

        it('formats in Chinese (zh)', () => {
            expect(formatPolaroidDate(testDate, 'zh')).toBe('2026年6月8日');
        });

        it('formats in Arabic (ar)', () => {
            expect(formatPolaroidDate(testDate, 'ar')).toBe('8 يونيو 2026');
        });
    });

    describe('formatPostDetailDay', () => {
        it('formats weekday correctly across languages', () => {
            expect(formatPostDetailDay(testDate, 'it')).toBe('Lunedì');
            expect(formatPostDetailDay(testDate, 'en')).toBe('Monday');
            expect(formatPostDetailDay(testDate, 'tr')).toBe('Pazartesi');
            expect(formatPostDetailDay(testDate, 'es')).toBe('Lunes');
            expect(formatPostDetailDay(testDate, 'fr')).toBe('Lundi');
            expect(formatPostDetailDay(testDate, 'de')).toBe('Montag');
            expect(formatPostDetailDay(testDate, 'pt')).toBe('Segunda-feira');
            expect(formatPostDetailDay(testDate, 'ru')).toBe('Понедельник');
        });
    });

    describe('formatPostDetailDate', () => {
        it('matches formatPolaroidDate output', () => {
            expect(formatPostDetailDate(testDate, 'it')).toBe('8 giugno 2026');
            expect(formatPostDetailDate(testDate, 'en')).toBe('June 8, 2026');
        });
    });
});
