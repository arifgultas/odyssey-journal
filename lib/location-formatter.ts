/**
 * Location Formatter Utility
 * Provides multilingual localized city names, country abbreviations, and formatted location strings
 * for post cards and detail screens across all 12 supported languages:
 * tr, en, it, es, fr, de, pt, ru, ja, ko, zh, ar.
 */

export interface CountryData {
    code: string; // ISO 2-letter standard (e.g. RO, TR, ES, IT, DE, FR)
    trAbbr: string; // Turkish localized abbreviation (e.g. İS, TR, İT, AL, ABD, İNG, YU, AVU)
    names: Record<string, string>; // Localized full name per language code
    aliases: string[]; // Aliases for loose matching
}

export interface CityTranslation {
    names: Record<string, string>; // Localized city name per language code
    countryCode?: string; // ISO 2-letter country code
    aliases: string[]; // Aliases for loose matching
}

export interface PostLocationData {
    city?: string;
    country?: string;
    address?: string;
    name?: string;
}

export const COUNTRY_DATABASE: CountryData[] = [
    {
        code: 'RO',
        trAbbr: 'RO',
        names: {
            en: 'Romania', tr: 'Romanya', it: 'Romania', es: 'Rumanía',
            fr: 'Roumanie', de: 'Rumänien', pt: 'Romênia', ru: 'Румыния',
            ja: 'ルーマニア', ko: '루마니아', zh: '罗马尼亚', ar: 'رومانيا',
        },
        aliases: ['romania', 'romanya', 'ro', 'rou', 'romani', 'românia', 'bucarest', 'bucharest', 'bükreş', 'bukres'],
    },
    {
        code: 'TR',
        trAbbr: 'TR',
        names: {
            en: 'Turkey', tr: 'Türkiye', it: 'Turchia', es: 'Turquía',
            fr: 'Turquie', de: 'Türkei', pt: 'Turquia', ru: 'Турция',
            ja: 'トルコ', ko: '튀르키예', zh: '土耳其', ar: 'تركيا',
        },
        aliases: ['turkey', 'türkiye', 'turkiye', 'tr', 'tur', 'tü', 'tu', 'istanbul', 'ankara', 'izmir'],
    },
    {
        code: 'IT',
        trAbbr: 'İT',
        names: {
            en: 'Italy', tr: 'İtalya', it: 'Italia', es: 'Italia',
            fr: 'Italie', de: 'Italien', pt: 'Itália', ru: 'Италия',
            ja: 'イタリア', ko: '이탈리아', zh: '意大利', ar: 'إيطاليا',
        },
        aliases: ['italy', 'italya', 'italia', 'it', 'ita', 'it', 'roma', 'rome', 'milan', 'milano', 'venice', 'venezia'],
    },
    {
        code: 'ES',
        trAbbr: 'İS',
        names: {
            en: 'Spain', tr: 'İspanya', it: 'Spagna', es: 'España',
            fr: 'Espagne', de: 'Spanien', pt: 'Espanha', ru: 'Испания',
            ja: 'スペイン', ko: '스페인', zh: '西班牙', ar: 'إسبانيا',
        },
        aliases: ['spain', 'ispanya', 'españa', 'espana', 'es', 'esp', 'is', 'iş', 'madrid', 'barcelona'],
    },
    {
        code: 'DE',
        trAbbr: 'AL',
        names: {
            en: 'Germany', tr: 'Almanya', it: 'Germania', es: 'Alemania',
            fr: 'Allemagne', de: 'Deutschland', pt: 'Alemanha', ru: 'Германия',
            ja: 'ドイツ', ko: '독일', zh: '德国', ar: 'ألمانيا',
        },
        aliases: ['germany', 'almanya', 'deutschland', 'de', 'deu', 'ger', 'al', 'berlin', 'munich', 'münchen'],
    },
    {
        code: 'FR',
        trAbbr: 'FR',
        names: {
            en: 'France', tr: 'Fransa', it: 'Francia', es: 'Francia',
            fr: 'France', de: 'Frankreich', pt: 'França', ru: 'Франция',
            ja: 'フランス', ko: '프랑스', zh: '法国', ar: 'فرنسا',
        },
        aliases: ['france', 'fransa', 'fr', 'fra', 'paris'],
    },
    {
        code: 'UK',
        trAbbr: 'İNG',
        names: {
            en: 'United Kingdom', tr: 'Birleşik Krallık', it: 'Regno Unito', es: 'Reino Unido',
            fr: 'Royaume-Uni', de: 'Vereinigtes Königreich', pt: 'Reino Unido', ru: 'Великобритания',
            ja: 'イギリス', ko: '영국', zh: '英国', ar: 'المملكة المتحدة',
        },
        aliases: [
            'united kingdom', 'great britain', 'england', 'britain', 'uk', 'gb', 'gbr',
            'birleşik krallık', 'ingiltere', 'ing', 'scotland', 'wales', 'london', 'londra',
        ],
    },
    {
        code: 'US',
        trAbbr: 'ABD',
        names: {
            en: 'United States', tr: 'Amerika Birleşik Devletleri', it: 'Stati Uniti', es: 'Estados Unidos',
            fr: 'États-Unis', de: 'Vereinigte Staaten', pt: 'Estados Unidos', ru: 'США',
            ja: 'アメリカ', ko: '미국', zh: '美国', ar: 'الولايات المتحدة',
        },
        aliases: [
            'united states', 'united states of america', 'usa', 'us', 'abd',
            'amerika birleşik devletleri', 'amerika', 'new york', 'california',
        ],
    },
    {
        code: 'GR',
        trAbbr: 'YU',
        names: {
            en: 'Greece', tr: 'Yunanistan', it: 'Grecia', es: 'Grecia',
            fr: 'Grèce', de: 'Griechenland', pt: 'Grécia', ru: 'Греция',
            ja: 'ギリシャ', ko: '그리스', zh: '希腊', ar: 'اليونان',
        },
        aliases: ['greece', 'yunanistan', 'hellas', 'gr', 'grc', 'athens', 'atina', 'santorini'],
    },
    {
        code: 'AT',
        trAbbr: 'AVU',
        names: {
            en: 'Austria', tr: 'Avusturya', it: 'Austria', es: 'Austria',
            fr: 'Autriche', de: 'Österreich', pt: 'Áustria', ru: 'Австрия',
            ja: 'オーストリア', ko: '오스트리아', zh: '奥地利', ar: 'النمسا',
        },
        aliases: ['austria', 'avusturya', 'österreich', 'osterreich', 'at', 'aut', 'vienna', 'viyana'],
    },
    {
        code: 'CZ',
        trAbbr: 'ÇEK',
        names: {
            en: 'Czech Republic', tr: 'Çekya', it: 'Repubblica Ceca', es: 'República Checa',
            fr: 'République tchèque', de: 'Tschechien', pt: 'República Checa', ru: 'Чехия',
            ja: 'チェコ', ko: '체코', zh: '捷克', ar: 'التشيك',
        },
        aliases: ['czech republic', 'czechia', 'çekya', 'cekya', 'çek cumhuriyeti', 'cz', 'cze', 'prague', 'prag'],
    },
    {
        code: 'PT',
        trAbbr: 'PO',
        names: {
            en: 'Portugal', tr: 'Portekiz', it: 'Portogallo', es: 'Portugal',
            fr: 'Portugal', de: 'Portugal', pt: 'Portugal', ru: 'Португалия',
            ja: 'ポルトガル', ko: '포르투갈', zh: '葡萄牙', ar: 'البرتغال',
        },
        aliases: ['portugal', 'portekiz', 'pt', 'prt', 'lisbon', 'lizbon'],
    },
    {
        code: 'NL',
        trAbbr: 'HOL',
        names: {
            en: 'Netherlands', tr: 'Hollanda', it: 'Paesi Bassi', es: 'Países Bajos',
            fr: 'Pays-Bas', de: 'Niederlande', pt: 'Países Baixos', ru: 'Нидерланды',
            ja: 'オランダ', ko: '네덜란드', zh: '荷兰', ar: 'هولندا',
        },
        aliases: ['netherlands', 'holland', 'hollanda', 'nederland', 'nl', 'nld', 'amsterdam'],
    },
    {
        code: 'CH',
        trAbbr: 'İSV',
        names: {
            en: 'Switzerland', tr: 'İsviçre', it: 'Svizzera', es: 'Suiza',
            fr: 'Suisse', de: 'Schweiz', pt: 'Suíça', ru: 'Швейцария',
            ja: 'スイス', ko: '스위스', zh: '瑞士', ar: 'سويسرا',
        },
        aliases: ['switzerland', 'isviçre', 'isvicre', 'schweiz', 'suisse', 'svizzera', 'ch', 'che', 'zurich', 'geneva'],
    },
    {
        code: 'EG',
        trAbbr: 'MIS',
        names: {
            en: 'Egypt', tr: 'Mısır', it: 'Egitto', es: 'Egipto',
            fr: 'Égypte', de: 'Ägypten', pt: 'Egito', ru: 'Египет',
            ja: 'エジプト', ko: '이집트', zh: '埃及', ar: 'مصر',
        },
        aliases: ['egypt', 'mısır', 'misir', 'eg', 'egy', 'cairo', 'kahire'],
    },
    {
        code: 'RU',
        trAbbr: 'RU',
        names: {
            en: 'Russia', tr: 'Rusya', it: 'Russia', es: 'Rusia',
            fr: 'Russie', de: 'Russland', pt: 'Rússia', ru: 'Россия',
            ja: 'ロシア', ko: '러시아', zh: '俄罗斯', ar: 'روسيا',
        },
        aliases: ['russia', 'rusya', 'rossiya', 'ru', 'rus', 'moscow', 'moskova'],
    },
    {
        code: 'JP',
        trAbbr: 'JA',
        names: {
            en: 'Japan', tr: 'Japonya', it: 'Giappone', es: 'Japón',
            fr: 'Japon', de: 'Japan', pt: 'Japão', ru: 'Япония',
            ja: '日本', ko: '일본', zh: '日本', ar: 'اليابان',
        },
        aliases: ['japan', 'japonya', 'nippon', 'nihon', 'jp', 'jpn', 'tokyo'],
    },
    {
        code: 'HU',
        trAbbr: 'MAC',
        names: {
            en: 'Hungary', tr: 'Macaristan', it: 'Ungheria', es: 'Hungría',
            fr: 'Hongrie', de: 'Ungarn', pt: 'Hungria', ru: 'Венгрия',
            ja: 'ハンガリー', ko: '헝가리', zh: '匈牙利', ar: 'المجر',
        },
        aliases: ['hungary', 'macaristan', 'magyarország', 'hu', 'hun', 'budapest', 'budapeşte'],
    },
    {
        code: 'PL',
        trAbbr: 'POL',
        names: {
            en: 'Poland', tr: 'Polonya', it: 'Polonia', es: 'Polonia',
            fr: 'Pologne', de: 'Polen', pt: 'Polônia', ru: 'Польша',
            ja: 'ポーランド', ko: '폴란드', zh: '波兰', ar: 'بولندا',
        },
        aliases: ['poland', 'polonya', 'polska', 'pl', 'pol', 'warsaw', 'varşova'],
    },
    {
        code: 'HR',
        trAbbr: 'HIR',
        names: {
            en: 'Croatia', tr: 'Hırvatistan', it: 'Croazia', es: 'Croacia',
            fr: 'Croatie', de: 'Kroatien', pt: 'Croácia', ru: 'Хорватия',
            ja: 'クロアチア', ko: '크로아티아', zh: '克罗地亚', ar: 'كرواتيا',
        },
        aliases: ['croatia', 'hırvatistan', 'hirvatistan', 'hrvatska', 'hr', 'hrv', 'zagreb', 'dubrovnik'],
    },
    {
        code: 'DK',
        trAbbr: 'DAN',
        names: {
            en: 'Denmark', tr: 'Danimarka', it: 'Danimarca', es: 'Dinamarca',
            fr: 'Danemark', de: 'Dänemark', pt: 'Dinamarca', ru: 'Дания',
            ja: 'デンマーク', ko: '덴마크', zh: '丹麦', ar: 'الدانمارك',
        },
        aliases: ['denmark', 'danimarka', 'danmark', 'dk', 'dnk', 'copenhagen', 'kopenhag'],
    },
    {
        code: 'SE',
        trAbbr: 'İSVE',
        names: {
            en: 'Sweden', tr: 'İsveç', it: 'Svezia', es: 'Suecia',
            fr: 'Suède', de: 'Schweden', pt: 'Suécia', ru: 'Швеция',
            ja: 'スウェーデン', ko: '스웨덴', zh: '瑞典', ar: 'السويد',
        },
        aliases: ['sweden', 'isveç', 'isvec', 'sverige', 'se', 'swe', 'stockholm'],
    },
    {
        code: 'NO',
        trAbbr: 'NO',
        names: {
            en: 'Norway', tr: 'Norveç', it: 'Norvegia', es: 'Noruega',
            fr: 'Norvège', de: 'Norwegen', pt: 'Noruega', ru: 'Норвегия',
            ja: 'ノルウェー', ko: '노르웨이', zh: '挪威', ar: 'النرويج',
        },
        aliases: ['norway', 'norveç', 'norvec', 'norge', 'no', 'nor', 'oslo'],
    },
    {
        code: 'BE',
        trAbbr: 'BEL',
        names: {
            en: 'Belgium', tr: 'Belçika', it: 'Belgio', es: 'Bélgica',
            fr: 'Belgique', de: 'Belgien', pt: 'Bélgica', ru: 'Бельгия',
            ja: 'ベルギー', ko: '벨기에', zh: '比利时', ar: 'بلجيكا',
        },
        aliases: ['belgium', 'belçika', 'belcika', 'belgique', 'be', 'bel', 'brussels', 'brüksel'],
    },
    {
        code: 'BR',
        trAbbr: 'BR',
        names: {
            en: 'Brazil', tr: 'Brezilya', it: 'Brasile', es: 'Brasil',
            fr: 'Brésil', de: 'Brasilien', pt: 'Brasil', ru: 'Бразилия',
            ja: 'ブラジル', ko: '브라질', zh: '巴西', ar: 'البرازيل',
        },
        aliases: ['brazil', 'brezilya', 'brasil', 'br', 'bra', 'rio', 'sao paulo'],
    },
    {
        code: 'AR',
        trAbbr: 'AR',
        names: {
            en: 'Argentina', tr: 'Arjantin', it: 'Argentina', es: 'Argentina',
            fr: 'Argentine', de: 'Argentinien', pt: 'Argentina', ru: 'Аргентина',
            ja: 'アルゼンチン', ko: '아르헨티나', zh: '阿根廷', ar: 'الأرجنتين',
        },
        aliases: ['argentina', 'arjantin', 'ar', 'arg', 'buenos aires'],
    },
    {
        code: 'AE',
        trAbbr: 'BAE',
        names: {
            en: 'United Arab Emirates', tr: 'Birleşik Arap Emirlikleri', it: 'Emirati Arabi Uniti', es: 'Emiratos Árabes Unidos',
            fr: 'Émirats arabes unis', de: 'Vereinigte Arabische Emirate', pt: 'Emirados Árabes Unidos', ru: 'ОАЭ',
            ja: 'アラブ首長国連邦', ko: '아랍에미리트', zh: '阿联酋', ar: 'الإمارات',
        },
        aliases: ['united arab emirates', 'uae', 'ae', 'are', 'birleşik arap emirlikleri', 'bae', 'dubai', 'abu dhabi'],
    },
];

export const CITY_DATABASE: CityTranslation[] = [
    // Bucharest (Romania)
    {
        names: {
            en: 'Bucharest', tr: 'Bükreş', it: 'Bucarest', es: 'Bucarest',
            fr: 'Bucarest', de: 'Bukarest', pt: 'Bucareste', ru: 'Бухарест',
            ja: 'ブカレスト', ko: '부쿠레슈티', zh: '布加勒斯特', ar: 'بوخارست',
        },
        countryCode: 'RO',
        aliases: ['bucharest', 'bükreş', 'bukres', 'bucuresti', 'bucurești', 'bucarest', 'bukarest'],
    },

    // Rome (Italy)
    {
        names: {
            en: 'Rome', tr: 'Roma', it: 'Roma', es: 'Roma',
            fr: 'Rome', de: 'Rom', pt: 'Roma', ru: 'Рим',
            ja: 'ローマ', ko: '로마', zh: '罗马', ar: 'روما',
        },
        countryCode: 'IT',
        aliases: ['rome', 'roma', 'rom'],
    },

    // Venice (Italy)
    {
        names: {
            en: 'Venice', tr: 'Venedik', it: 'Venezia', es: 'Venecia',
            fr: 'Venise', de: 'Venedig', pt: 'Veneza', ru: 'Венеция',
            ja: 'ヴェネツィア', ko: '베네치아', zh: '威尼斯', ar: 'البندقية',
        },
        countryCode: 'IT',
        aliases: ['venice', 'venezia', 'venedik', 'venise'],
    },

    // Florence (Italy)
    {
        names: {
            en: 'Florence', tr: 'Floransa', it: 'Firenze', es: 'Florencia',
            fr: 'Florence', de: 'Florenz', pt: 'Florença', ru: 'Флоренция',
            ja: 'フィレンツェ', ko: '피렌체', zh: '佛罗伦萨', ar: 'فلورنسا',
        },
        countryCode: 'IT',
        aliases: ['florence', 'firenze', 'floransa', 'florenz'],
    },

    // Milan (Italy)
    {
        names: {
            en: 'Milan', tr: 'Milano', it: 'Milano', es: 'Milán',
            fr: 'Milan', de: 'Mailand', pt: 'Milão', ru: 'Милан',
            ja: 'ミラノ', ko: '밀라노', zh: '米兰', ar: 'ميلانو',
        },
        countryCode: 'IT',
        aliases: ['milan', 'milano', 'mailand'],
    },

    // Naples (Italy)
    {
        names: {
            en: 'Naples', tr: 'Napoli', it: 'Napoli', es: 'Nápoles',
            fr: 'Naples', de: 'Neapel', pt: 'Nápoles', ru: 'Неаполь',
            ja: 'ナポリ', ko: '나폴리', zh: '那不勒斯', ar: 'نابولي',
        },
        countryCode: 'IT',
        aliases: ['naples', 'napoli', 'neapel'],
    },

    // Istanbul (Turkey)
    {
        names: {
            en: 'Istanbul', tr: 'İstanbul', it: 'Istanbul', es: 'Estambul',
            fr: 'Istanbul', de: 'Istanbul', pt: 'Istambul', ru: 'Стамбул',
            ja: 'イスタンブール', ko: '이스탄불', zh: '伊斯坦布尔', ar: 'إسطنبول',
        },
        countryCode: 'TR',
        aliases: ['istanbul', 'ıstanbul', 'constantinople', 'estambul'],
    },

    // Vienna (Austria)
    {
        names: {
            en: 'Vienna', tr: 'Viyana', it: 'Vienna', es: 'Viena',
            fr: 'Vienne', de: 'Wien', pt: 'Viena', ru: 'Вена',
            ja: 'ウィーン', ko: '빈', zh: '维也纳', ar: 'فيينا',
        },
        countryCode: 'AT',
        aliases: ['vienna', 'wien', 'viyana', 'viena'],
    },

    // Prague (Czechia)
    {
        names: {
            en: 'Prague', tr: 'Prag', it: 'Praga', es: 'Praga',
            fr: 'Prague', de: 'Prag', pt: 'Praga', ru: 'Прага',
            ja: 'プラハ', ko: '프라하', zh: '布拉格', ar: 'براغ',
        },
        countryCode: 'CZ',
        aliases: ['prague', 'praha', 'prag', 'praga'],
    },

    // Munich (Germany)
    {
        names: {
            en: 'Munich', tr: 'Münih', it: 'Monaco di Baviera', es: 'Múnich',
            fr: 'Munich', de: 'München', pt: 'Munique', ru: 'Мюнхен',
            ja: 'ミュンヘン', ko: '뮌헨', zh: '慕尼黑', ar: 'ميونخ',
        },
        countryCode: 'DE',
        aliases: ['munich', 'münchen', 'munchen', 'münih', 'munih'],
    },

    // Cologne (Germany)
    {
        names: {
            en: 'Cologne', tr: 'Köln', it: 'Colonia', es: 'Colonia',
            fr: 'Cologne', de: 'Köln', pt: 'Colônia', ru: 'Кёльн',
            ja: 'ケルン', ko: '쾰른', zh: '科隆', ar: 'كولونيا',
        },
        countryCode: 'DE',
        aliases: ['cologne', 'köln', 'koln', 'colonia'],
    },

    // Athens (Greece)
    {
        names: {
            en: 'Athens', tr: 'Atina', it: 'Atene', es: 'Atenas',
            fr: 'Athènes', de: 'Athen', pt: 'Atenas', ru: 'Афины',
            ja: 'アテネ', ko: '아테네', zh: '雅典', ar: 'أثينا',
        },
        countryCode: 'GR',
        aliases: ['athens', 'athina', 'atina', 'atene', 'atenas'],
    },

    // London (UK)
    {
        names: {
            en: 'London', tr: 'Londra', it: 'Londra', es: 'Londres',
            fr: 'Londres', de: 'London', pt: 'Londres', ru: 'Лондон',
            ja: 'ロンドン', ko: '런던', zh: '伦敦', ar: 'لندن',
        },
        countryCode: 'UK',
        aliases: ['london', 'londra', 'londres'],
    },

    // Paris (France)
    {
        names: {
            en: 'Paris', tr: 'Paris', it: 'Parigi', es: 'París',
            fr: 'Paris', de: 'Paris', pt: 'Paris', ru: 'Париж',
            ja: 'パリ', ko: '파리', zh: '巴黎', ar: 'باريس',
        },
        countryCode: 'FR',
        aliases: ['paris', 'parigi'],
    },

    // Lisbon (Portugal)
    {
        names: {
            en: 'Lisbon', tr: 'Lizbon', it: 'Lisbona', es: 'Lisboa',
            fr: 'Lisbonne', de: 'Lissabon', pt: 'Lisboa', ru: 'Лиссабон',
            ja: 'リスボン', ko: '리스본', zh: '里斯本', ar: 'لشبونة',
        },
        countryCode: 'PT',
        aliases: ['lisbon', 'lisboa', 'lizbon', 'lisbona', 'lissabon'],
    },

    // Madrid (Spain)
    {
        names: {
            en: 'Madrid', tr: 'Madrid', it: 'Madrid', es: 'Madrid',
            fr: 'Madrid', de: 'Madrid', pt: 'Madri', ru: 'Мадрид',
            ja: 'マドリード', ko: '마드리드', zh: '马德里', ar: 'مدريد',
        },
        countryCode: 'ES',
        aliases: ['madrid'],
    },

    // Barcelona (Spain)
    {
        names: {
            en: 'Barcelona', tr: 'Barselona', it: 'Barcellona', es: 'Barcelona',
            fr: 'Barcelone', de: 'Barcelona', pt: 'Barcelona', ru: 'Барселона',
            ja: 'バルセロナ', ko: '바르셀로나', zh: '巴塞罗那', ar: 'برشلونة',
        },
        countryCode: 'ES',
        aliases: ['barcelona', 'barselona', 'barcellona'],
    },

    // Cairo (Egypt)
    {
        names: {
            en: 'Cairo', tr: 'Kahire', it: 'Il Cairo', es: 'El Cairo',
            fr: 'Le Caire', de: 'Kairo', pt: 'Cairo', ru: 'Каир',
            ja: 'カイロ', ko: '카이로', zh: '开罗', ar: 'القاهرة',
        },
        countryCode: 'EG',
        aliases: ['cairo', 'kahire', 'al-qahirah', 'kairo'],
    },

    // Jerusalem (Israel)
    {
        names: {
            en: 'Jerusalem', tr: 'Kudüs', it: 'Gerusalemme', es: 'Jerusalén',
            fr: 'Jérusalem', de: 'Jerusalem', pt: 'Jerusalém', ru: 'Иерусалим',
            ja: 'エルサレム', ko: '예루살렘', zh: '耶路撒冷', ar: 'القدس',
        },
        countryCode: 'IL',
        aliases: ['jerusalem', 'yerushalayim', 'al-quds', 'kudüs', 'kudus', 'gerusalemme'],
    },

    // Warsaw (Poland)
    {
        names: {
            en: 'Warsaw', tr: 'Varşova', it: 'Varsavia', es: 'Varsovia',
            fr: 'Varsovie', de: 'Warschau', pt: 'Varsóvia', ru: 'Варшава',
            ja: 'ワルシャワ', ko: '바르샤바', zh: '华沙', ar: 'وارسو',
        },
        countryCode: 'PL',
        aliases: ['warsaw', 'warszawa', 'varşova', 'varsova', 'varsavia'],
    },

    // Budapest (Hungary)
    {
        names: {
            en: 'Budapest', tr: 'Budapeşte', it: 'Budapest', es: 'Budapest',
            fr: 'Budapest', de: 'Budapest', pt: 'Budapeste', ru: 'Будапешт',
            ja: 'ブダペスト', ko: '부다페스트', zh: '布达佩斯', ar: 'بودابست',
        },
        countryCode: 'HU',
        aliases: ['budapest', 'budapeşte', 'budapeste'],
    },

    // Copenhagen (Denmark)
    {
        names: {
            en: 'Copenhagen', tr: 'Kopenhag', it: 'Copenaghen', es: 'Copenhague',
            fr: 'Copenhague', de: 'Kopenhagen', pt: 'Copenhague', ru: 'Копенгаген',
            ja: 'コペンハーゲン', ko: '코펜하겐', zh: '哥本哈根', ar: 'كوبنهاغن',
        },
        countryCode: 'DK',
        aliases: ['copenhagen', 'københavn', 'kobenhavn', 'kopenhag', 'copenaghen'],
    },

    // Brussels (Belgium)
    {
        names: {
            en: 'Brussels', tr: 'Brüksel', it: 'Bruxelles', es: 'Bruselas',
            fr: 'Bruxelles', de: 'Brüssel', pt: 'Bruxelas', ru: 'Брюссель',
            ja: 'ブリュッセル', ko: '브뤼셀', zh: '布鲁塞尔', ar: 'بروكسل',
        },
        countryCode: 'BE',
        aliases: ['brussels', 'bruxelles', 'brussel', 'brüksel', 'bruksel', 'bruselas'],
    },

    // Geneva (Switzerland)
    {
        names: {
            en: 'Geneva', tr: 'Cenevre', it: 'Ginevra', es: 'Ginebra',
            fr: 'Genève', de: 'Genf', pt: 'Genebra', ru: 'Женева',
            ja: 'ジュネーヴ', ko: '제네바', zh: '日内瓦', ar: 'جنيف',
        },
        countryCode: 'CH',
        aliases: ['geneva', 'genève', 'geneve', 'cenevre', 'ginevra'],
    },

    // Zurich (Switzerland)
    {
        names: {
            en: 'Zurich', tr: 'Zürih', it: 'Zurigo', es: 'Zúrich',
            fr: 'Zurich', de: 'Zürich', pt: 'Zurique', ru: 'Цюрих',
            ja: 'チューリッヒ', ko: '취리히', zh: '苏黎世', ar: 'زيورخ',
        },
        countryCode: 'CH',
        aliases: ['zurich', 'zürich', 'zürih', 'zurih', 'zurigo'],
    },

    // Moscow (Russia)
    {
        names: {
            en: 'Moscow', tr: 'Moskova', it: 'Mosca', es: 'Moscú',
            fr: 'Moscou', de: 'Moskau', pt: 'Moscou', ru: 'Москва',
            ja: 'モスクワ', ko: '모스크바', zh: '莫斯科', ar: 'موسكو',
        },
        countryCode: 'RU',
        aliases: ['moscow', 'moskva', 'moskova', 'mosca'],
    },

    // Saint Petersburg (Russia)
    {
        names: {
            en: 'Saint Petersburg', tr: 'Sankt Petersburg', it: 'San Pietroburgo', es: 'San Petersburgo',
            fr: 'Saint-Pétersbourg', de: 'Sankt Petersburg', pt: 'São Petersburgo', ru: 'Санкт-Петербург',
            ja: 'サンクトペテルブルク', ko: '상트페테르부르크', zh: '圣彼得堡', ar: 'سانت بطرسبرغ',
        },
        countryCode: 'RU',
        aliases: ['saint petersburg', 'st petersburg', 'st. petersburg', 'sankt petersburg', 'san pietroburgo'],
    },

    // Tokyo (Japan)
    {
        names: {
            en: 'Tokyo', tr: 'Tokyo', it: 'Tokyo', es: 'Tokio',
            fr: 'Tokyo', de: 'Tokio', pt: 'Tóquio', ru: 'Токио',
            ja: '東京', ko: '도쿄', zh: '东京', ar: 'طوكيو',
        },
        countryCode: 'JP',
        aliases: ['tokyo', 'tokio'],
    },

    // Beijing (China)
    {
        names: {
            en: 'Beijing', tr: 'Pekin', it: 'Pechino', es: 'Pekín',
            fr: 'Pékin', de: 'Peking', pt: 'Pequim', ru: 'Пекин',
            ja: '北京', ko: '베이징', zh: '北京', ar: 'بكين',
        },
        countryCode: 'CN',
        aliases: ['beijing', 'pekin', 'pechino'],
    },

    // Seoul (South Korea)
    {
        names: {
            en: 'Seoul', tr: 'Seul', it: 'Seul', es: 'Seúl',
            fr: 'Séoul', de: 'Seoul', pt: 'Seul', ru: 'Сеул',
            ja: 'ソウル', ko: '서울', zh: '首尔', ar: 'سيول',
        },
        countryCode: 'KR',
        aliases: ['seoul', 'seul'],
    },

    // Sydney (Australia)
    {
        names: {
            en: 'Sydney', tr: 'Sidney', it: 'Sydney', es: 'Sídney',
            fr: 'Sydney', de: 'Sydney', pt: 'Sydney', ru: 'Сидней',
            ja: 'シドニー', ko: '시드니', zh: '悉尼', ar: 'سيدني',
        },
        countryCode: 'AU',
        aliases: ['sydney', 'sidney'],
    },
];

/**
 * Normalizes an input string for loose matching against aliases
 */
export function normalizeLocationString(str: string): string {
    if (!str || typeof str !== 'string') return '';
    return str
        .replace(/İ/g, 'i')
        .replace(/I/g, 'i')
        .replace(/ı/g, 'i')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

/**
 * Finds a matching city entry from CITY_DATABASE
 */
export function findCityEntry(cityString: string): CityTranslation | null {
    if (!cityString || typeof cityString !== 'string') return null;

    const trimmed = cityString.trim();
    if (!trimmed) return null;

    const normalized = normalizeLocationString(trimmed);

    // 1. Exact match on any language name or alias
    for (const city of CITY_DATABASE) {
        if (
            Object.values(city.names).some((name) => normalizeLocationString(name) === normalized) ||
            city.aliases.some((a) => normalizeLocationString(a) === normalized)
        ) {
            return city;
        }
    }

    // 2. Substring / word boundary match (only for aliases >= 4 chars)
    for (const city of CITY_DATABASE) {
        for (const alias of city.aliases) {
            const normAlias = normalizeLocationString(alias);
            if (normAlias.length >= 4) {
                const escaped = normAlias.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                const regex = new RegExp(`(^|\\b|\\s)${escaped}(\\b|\\s|$)`, 'i');
                if (regex.test(normalized)) {
                    return city;
                }
            }
        }
    }

    return null;
}

/**
 * Translates/localizes a city name according to the viewer's active language code.
 * Supports: tr, en, it, es, fr, de, pt, ru, ja, ko, zh, ar.
 */
export function getLocalizedCityName(cityString: string, language: string = 'en'): string {
    if (!cityString || typeof cityString !== 'string') return '';

    const trimmed = cityString.trim();
    if (!trimmed) return '';

    const lang = (language || 'en').toLowerCase().split('-')[0];
    const match = findCityEntry(trimmed);

    if (match) {
        return match.names[lang] || match.names.en || match.names.tr || trimmed;
    }

    // Fallback: If not in dictionary and target is not Turkish, convert Turkish special characters to ASCII Latin
    if (lang !== 'tr') {
        return trimmed
            .replace(/İ/g, 'I')
            .replace(/ı/g, 'i')
            .replace(/ş/g, 's')
            .replace(/Ş/g, 'S')
            .replace(/ç/g, 'c')
            .replace(/Ç/g, 'C')
            .replace(/ğ/g, 'g')
            .replace(/Ğ/g, 'G')
            .replace(/ö/g, 'o')
            .replace(/Ö/g, 'O')
            .replace(/ü/g, 'u')
            .replace(/Ü/g, 'U');
    }

    return trimmed;
}

/**
 * Finds a matching country entry from COUNTRY_DATABASE
 */
export function findCountryEntry(countryString: string): CountryData | null {
    if (!countryString || typeof countryString !== 'string') return null;

    const trimmed = countryString.trim();
    if (!trimmed) return null;

    const normalized = normalizeLocationString(trimmed);

    // 1. Exact match on codes, localized names, or aliases
    for (const item of COUNTRY_DATABASE) {
        if (
            normalizeLocationString(item.code) === normalized ||
            normalizeLocationString(item.trAbbr) === normalized ||
            Object.values(item.names).some((name) => normalizeLocationString(name) === normalized) ||
            item.aliases.some((alias) => normalizeLocationString(alias) === normalized)
        ) {
            return item;
        }
    }

    // 2. Word boundary match
    for (const item of COUNTRY_DATABASE) {
        for (const alias of item.aliases) {
            const normAlias = normalizeLocationString(alias);
            if (normAlias.length >= 3) {
                const escaped = normAlias.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                const regex = new RegExp(`(^|\\b|\\s)${escaped}(\\b|\\s|$)`, 'i');
                if (regex.test(normalized)) {
                    return item;
                }
            }
        }
    }

    return null;
}

/**
 * Normalizes a country string and looks up localized abbreviation based on user's active language:
 * - In Turkish: localized abbreviation (e.g. İS, TR, İT, AL, ABD, İNG, YU, AVU, RO)
 * - In all other languages (English, Italian, Spanish, French, German...): ISO 2-letter standard code (e.g. ES, TR, IT, DE, FR, US, UK, GR, AT, RO)
 */
export function getLocalizedCountryCode(countryString: string, language: string = 'en'): string {
    if (!countryString || typeof countryString !== 'string') return '';

    const trimmed = countryString.trim();
    if (!trimmed) return '';

    const lang = (language || 'en').toLowerCase().split('-')[0];
    const match = findCountryEntry(trimmed);

    if (match) {
        return lang === 'tr' ? match.trAbbr : match.code;
    }

    // If it's already a 2-3 letter code
    if (trimmed.length <= 3 && !trimmed.includes(' ')) {
        return trimmed.toUpperCase();
    }

    // Fallback: first 2 characters
    if (lang === 'tr') {
        return trimmed.slice(0, 2).toLocaleUpperCase('tr-TR');
    }

    return trimmed.slice(0, 2).toUpperCase();
}

/**
 * Returns the full localized country name in the user's active language:
 * - e.g. "Romania" -> "Romanya" (tr), "Romania" (it), "Romania" (en), "Rumanía" (es)
 */
export function getLocalizedCountryName(countryString: string, language: string = 'en'): string {
    if (!countryString || typeof countryString !== 'string') return '';

    const trimmed = countryString.trim();
    if (!trimmed) return '';

    const lang = (language || 'en').toLowerCase().split('-')[0];
    const match = findCountryEntry(trimmed);

    if (match) {
        return match.names[lang] || match.names.en || match.names.tr || trimmed;
    }

    return trimmed;
}

/**
 * Formats location for post polaroid card: "City, CC"
 * E.g.:
 * - Italian viewer: "Bucarest, RO", "Roma, IT", "Madrid, ES", "Istanbul, TR"
 * - Turkish viewer: "Bükreş, RO", "Roma, İT", "Madrid, İS", "İstanbul, TR"
 * - English viewer: "Bucharest, RO", "Rome, IT", "Madrid, ES", "Istanbul, TR"
 */
export function formatPostLocation(
    location?: PostLocationData | null,
    language: string = 'en',
    fallbackTitle: string = ''
): string {
    if (!location) {
        return fallbackTitle || '';
    }

    let rawCity = location.city?.trim();
    let rawCountry = location.country?.trim();

    // If city is not set but name or address is comma-separated (e.g. "Bükreş, Romanya")
    if (!rawCity && (location.name || location.address)) {
        const full = (location.name || location.address)!.trim();
        if (full.includes(',')) {
            const parts = full.split(',');
            rawCity = parts[0]?.trim();
            if (!rawCountry && parts.length > 1) {
                rawCountry = parts[1]?.trim();
            }
        } else {
            rawCity = full;
        }
    }

    // If rawCity contains a comma itself
    if (rawCity && rawCity.includes(',')) {
        const parts = rawCity.split(',');
        rawCity = parts[0]?.trim();
        if (!rawCountry && parts.length > 1) {
            rawCountry = parts[1]?.trim();
        }
    }

    // Auto-resolve country code if omitted and city is in database
    const cityEntry = rawCity ? findCityEntry(rawCity) : null;
    if (cityEntry && !rawCountry && cityEntry.countryCode) {
        rawCountry = cityEntry.countryCode;
    }

    const localizedCity = rawCity ? getLocalizedCityName(rawCity, language) : '';
    const localizedCountryCode = rawCountry ? getLocalizedCountryCode(rawCountry, language) : '';

    if (localizedCity && localizedCountryCode) {
        return `${localizedCity}, ${localizedCountryCode}`;
    }

    if (localizedCity) {
        return localizedCity;
    }

    if (localizedCountryCode) {
        return localizedCountryCode;
    }

    return location.name || location.address || fallbackTitle || '';
}
