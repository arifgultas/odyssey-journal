/**
 * One entry per screenshot to refresh. Coordinates are in the source screenshot's own pixels
 * (946x2048 for the iPhone 14 set, 922x2048 for Android). Regions are what the model may
 * repaint; `keep` cuts UI back out of a region; everything else is the real screenshot.
 */
const STYLE =
    'This is a real screenshot of the Odyssey Journal travel app. Keep the app interface, colors, ' +
    'fonts, layout and card tilt exactly as they are. Only replace the content inside the masked ' +
    'areas so it looks like a real, lived-in travel community. Photos must be natural, well-lit ' +
    'travel photography shot on a phone, no text or watermarks inside the photos.';

const SS = (name) => `SS/WhatsApp Image 2026-09-19 at 16.09.${name}.jpeg`;

// Messages: the one real conversation row, repeated down the screen.
const LETTER_ROW = 292;
const LETTER_PITCH = 230;
const letterRows = [];
for (let i = 0; i < 6; i++) {
    const r = LETTER_ROW + i * LETTER_PITCH;
    letterRows.push(
        { circle: [143, r + 103, 56] }, // avatar inside the gold ring
        { rect: [243, r + 59, 340, 46] }, // name
        { rect: [243, r + 110, 540, 46] }, // last message
        { rect: [690, r + 57, 180, 46] } // date, right-aligned
    );
}

const MAP_LABELS_EN =
    'All map labels in English: "Norwegian Sea", "Arctic Circle", "Stockholm", "Moscow", ' +
    '"Berlin", "EUROPE", "SAHARA DESERT", "AFRICA", "Cairo", "Lagos", "Nairobi", "Kinshasa", ' +
    '"Equator" - same label typography and placement style as Apple Maps satellite view.';

const TRAVEL_PIN_PHOTOS =
    'real travel photos: London Tower Bridge, a Paris street cafe, Barcelona Sagrada Familia, ' +
    'a Madrid plaza, the Rome Colosseum, the Amalfi coast, Santorini white houses, the Istanbul ' +
    'mosque skyline, Cappadocia balloons';

module.exports = {
    'feed-dark-en': {
        src: SS('52 (8)'),
        quality: 'medium',
        regions: [
            { poly: [[42, 577], [838, 537], [878, 1332], [82, 1372]] }, // tilted polaroid photo
            { circle: [139, 1677, 40] }, // author avatar
            { rect: [192, 1622, 330, 112] }, // author name + caption
            { rect: [156, 1770, 70, 50] }, // like count
            { rect: [300, 1766, 46, 50] }, // comment count
        ],
        // the old "0" beside the comment icon; the model drew its icon further right
        clear: [[282, 1768, 26, 46]],
        prompt:
            STYLE +
            ' The photo inside the tilted polaroid card: golden-hour view of the Galata Tower in ' +
            'Beyoğlu, Istanbul, seen from a narrow cobblestone street with old stone buildings, warm ' +
            'light. The small round avatar: a friendly young woman traveler, portrait photo. Next to ' +
            'the avatar, in the same serif fonts and colors as before: name "Elif Aydın" (bold, cream) ' +
            'and below it the caption "Sunset walk up to Galata" (warm beige). The like counter ' +
            'shows "128" and the comment counter shows "24", same font and color as the icons.',
    },

    // Second pass over explore-dark-en: the model drew the second card's bottom row higher than
    // the real one, so only that row is redone on top of the otherwise good result.
    'explore-dark-en-fix': {
        src: 'mockup_feature/_work/explore-dark-en/final.png',
        quality: 'medium',
        regions: [
            { rect: [340, 1394, 140, 66] }, // like count row
            { rect: [700, 1392, 172, 70], radius: 30 }, // author chip
        ],
        prompt:
            STYLE +
            ' In the second "Santorini Evenings" card, the bottom row must match the first card ' +
            'exactly: a grey heart icon followed by the like count "287" in the same small grey ' +
            'font, and on the right a rounded dark author chip with a small person icon and "Mert".',
    },

    'profile-dark-en': {
        src: SS('52 (1)'),
        quality: 'medium',
        regions: [
            { circle: [174, 587, 84] }, // avatar inside the gold ring
            { rect: [375, 525, 420, 130] }, // name + handle
            { rect: [168, 1030, 276, 60] }, // "2 FOLLOWERS"
            { rect: [606, 1030, 290, 60] }, // "2 FOLLOWING"
            { rect: [48, 1285, 850, 415], radius: 22 }, // travel map
        ],
        prompt:
            STYLE +
            ' Round avatar: portrait photo of a smiling young woman traveler with a scarf, outdoors. ' +
            'Name "Elif Aydın" in the same bold white serif, and below it "@elif.travels" in the same ' +
            'grey sans-serif. Follower buttons read "248 FOLLOWERS" and "186 FOLLOWING" in the same ' +
            'font, color and letter spacing. The travel map: the same dark satellite map of Europe ' +
            'with the same red pins, label "EUROPE" instead of the Turkish one, and in the bottom-left ' +
            'corner the Apple logo followed by "Maps" and a small underlined "Legal".',
    },

    'map-dark-en': {
        src: SS('52 (9)'),
        quality: 'medium',
        regions: [{ rect: [0, 215, 946, 1833] }],
        keep: [
            { rect: [38, 498, 458, 70], radius: 35 }, // "12 locations - 14 posts" pill
            { circle: [853, 1543, 58] }, // zoom in
            { circle: [853, 1669, 58] }, // zoom out
        ],
        // labels the model left in Turkish or mis-cased
        labels: [
            { rect: [824, 708, 122, 44], from: [0, 64], text: 'Moscow', color: '#FFFFFF', size: 23, shadow: true },
            { rect: [196, 1434, 346, 52], from: [0, 70], text: 'SAHARA DESERT', color: '#EDE6DA', size: 23, spacing: 6, shadow: true },
        ],
        prompt:
            STYLE +
            ' The map area: the same Apple Maps satellite view of Europe and North Africa at the same ' +
            'zoom and position. ' +
            MAP_LABELS_EN +
            ' Bottom-left: the Apple logo, "Maps" and a small underlined "Legal". Keep the round photo ' +
            'pins with gold rings and small dark pointers at the same places, showing ' +
            TRAVEL_PIN_PHOTOS +
            '. Keep the small gold "2" count badges.',
    },

    'explore-dark-en': {
        src: SS('52 (5)'),
        quality: 'medium',
        regions: [
            { rect: [80, 937, 214, 212], radius: 22 }, // post 1 thumbnail
            { rect: [326, 1010, 560, 66] }, // post 1 title
            { rect: [362, 1104, 90, 48] }, // post 1 likes
            { rect: [714, 1100, 150, 54], radius: 27 }, // post 1 author chip
            { rect: [80, 1242, 214, 212], radius: 22 }, // post 2 thumbnail
            { rect: [326, 1314, 560, 68] }, // post 2 title
            { rect: [362, 1409, 90, 48] }, // post 2 likes
            { rect: [714, 1405, 150, 54], radius: 27 }, // post 2 author chip
            { rect: [148, 1748, 210, 100] }, // destination 1 image
            { rect: [588, 1748, 212, 100] }, // destination 2 image
        ],
        prompt:
            STYLE +
            ' First popular post: square photo of hot-air balloons over Cappadocia at sunrise, title ' +
            '"Cappadocia at Sunrise", like count "342", author chip "Elif". Second popular post: photo ' +
            'of white houses and blue domes in Santorini at golden hour, title "Santorini Evenings", ' +
            'like count "287", author chip "Mert". Titles in the same bold white serif, counts and ' +
            'author names in the same small fonts and colors. The two destination card images at the ' +
            'bottom: the Eiffel Tower in Paris, and a Kyoto temple with autumn leaves.',
    },

    'city-dark-en': {
        src: SS('52 (4)'),
        quality: 'medium',
        // Per-card regions made the model shift the list (cards drifted out of their slots), so
        // the whole list area is repainted in one piece; the header stays the app's own.
        regions: [{ rect: [0, 300, 946, 1748] }],
        prompt:
            STYLE +
            ' Six city travel posts, top to bottom, each with a square photo on the left, a bold white ' +
            'serif title, a beige subtitle, the author name next to the small person icon and a like ' +
            'count next to the heart. ' +
            '1) Lisbon yellow tram on a steep street: "Lisbon Yellow Tram" / "Alfama, Lisbon" / "Maya R." / "42". ' +
            '2) Athens rooftops with the Acropolis: "Rooftops of Athens" / "Plaka, Athens" / "Nikos" / "37". ' +
            '3) Tokyo neon street at night: "Neon Nights" / "Shinjuku, Tokyo" / "Kenji" / "56". ' +
            '4) Amsterdam canal houses at dawn: "Canals at Dawn" / "Jordaan, Amsterdam" / "Sophie" / "31". ' +
            '5) Prague old town and Charles Bridge: "Old Town Colors" / "Prague" / "Tomás" / "24". ' +
            '6) Istanbul Galata Bridge at sunset with ferries: "Bosphorus Evening" / "Karaköy, Istanbul" / "Elif Aydın" / "63". ' +
            'The seventh card, cut off at the bottom, shows the top of a Venice canal photo.',
    },

    'newpost-dark-en': {
        src: SS('52 (3)'),
        quality: 'medium',
        regions: [
            { poly: [[448, 563], [788, 561], [805, 968], [466, 985]] }, // tilted polaroid placeholder
            { poly: [[860, 561], [946, 561], [946, 971], [844, 966]] }, // next one, cut off at the edge
            { rect: [82, 1758, 640, 76] }, // location field text
        ],
        prompt:
            STYLE +
            ' The tilted placeholder card becomes a real instant-film polaroid with a white frame ' +
            'holding a photo of hot-air balloons over the fairy chimneys of Cappadocia at dawn, same ' +
            'tilt and position. The card cut off at the right edge is another polaroid showing a cave ' +
            'hotel terrace. Inside the location field: a small pin icon and the text ' +
            '"Göreme, Cappadocia" in the same font as the other form fields.',
    },

    'letters-dark-en': {
        src: SS('52 (6)'),
        quality: 'medium',
        stack: { rect: [36, 290, 876, 212], count: 6, pitch: LETTER_PITCH },
        regions: letterRows,
        prompt:
            STYLE +
            ' A list of six conversations, each row: a round portrait photo inside the gold ring, the ' +
            'name in bold white sans-serif, the last message in beige, the date right-aligned in beige. ' +
            'Rows top to bottom: "Elif Aydın" / "The balloon ride was unreal!" / "2m"; ' +
            '"Mert Kaya" / "Sending you the Lisbon route" / "1h"; ' +
            '"Sophie Martin" / "Which cafe was that in Paris?" / "3h"; ' +
            '"Kenji Sato" / "Tokyo in spring, you have to come" / "Yesterday"; ' +
            '"Maya Rossi" / "Saved your Santorini post" / "Mon"; ' +
            '"Nikos P." / "Athens rooftop bar tip inside" / "Sep 12". ' +
            'Different people: young and middle-aged, men and women, varied ethnicities.',
    },

    'settings-dark-en': {
        src: SS('51 (4)'),
        quality: 'medium',
        regions: [
            { circle: [472, 563, 106] }, // avatar inside the gold ring
            { rect: [290, 728, 370, 72] }, // name
            { rect: [250, 804, 450, 50] }, // email
        ],
        keep: [{ circle: [553, 645, 36] }], // edit badge on the avatar
        prompt:
            STYLE +
            ' Round avatar: portrait photo of a smiling young woman traveler with a scarf. Name ' +
            '"Elif Aydın" centered in the same large white serif. Below it "elif@odyssey.travel" ' +
            'centered in the same grey italic.',
    },

    'map-light-android-en': {
        src: 'SS/android_map.jpeg',
        quality: 'medium',
        regions: [{ rect: [0, 174, 922, 1874] }],
        keep: [
            { rect: [36, 412, 440, 72], radius: 36 }, // "12 locations - 14 posts" pill
            { circle: [832, 1601, 52] }, // zoom in
            { circle: [832, 1724, 52] }, // zoom out
            { rect: [6, 1976, 150, 62] }, // Google logo
        ],
        // labels the model garbled
        labels: [
            { rect: [430, 856, 112, 48], text: 'Poland', size: 23 },
            { rect: [634, 940, 118, 46], from: [0, -52], text: 'Ukraine', size: 23 },
            { rect: [618, 1435, 96, 50], text: 'Egypt', size: 23 },
        ],
        prompt:
            STYLE +
            ' The map area: the same Google Maps light map of Europe and North Africa at the same zoom ' +
            'and position, with all country and sea labels in English (Norway, Sweden, Finland, ' +
            'Denmark, Poland, Belarus, Ukraine, Germany, Austria, France, Spain, Portugal, Italy, ' +
            'Greece, Türkiye, Romania, Tunisia, Algeria, Morocco, Libya, Egypt, Syria, Iraq, Mali, ' +
            'Niger, Chad, Sudan, Nigeria, Ghana, Ethiopia, Kenya, Gabon, "Mediterranean Sea", ' +
            '"Norwegian Sea", "Gulf of Guinea"). Keep the round photo pins with gold rings at the same ' +
            'places, showing ' +
            TRAVEL_PIN_PHOTOS +
            '. Keep the small gold "2" badges and the blue location dot.',
    },

    'profile-light-android-en': {
        src: 'SS/android_profile.jpeg',
        quality: 'medium',
        regions: [
            { circle: [169, 537, 80] }, // avatar inside the gold ring
            { rect: [366, 486, 400, 122] }, // name + handle
            { rect: [162, 980, 272, 58] }, // "2 FOLLOWERS"
            { rect: [598, 980, 280, 58] }, // "2 FOLLOWING"
            { rect: [43, 1236, 838, 413], radius: 18 }, // travel map
        ],
        keep: [{ rect: [52, 1578, 146, 54] }], // Google logo
        prompt:
            STYLE +
            ' Round avatar: portrait photo of a smiling young woman traveler with a scarf. Name ' +
            '"Elif Aydın" in the same bold dark serif and "@elif.travels" below in the same grey. ' +
            'Follower buttons read "248 FOLLOWERS" and "186 FOLLOWING" in the same font and letter ' +
            'spacing. Travel map: the same Google Maps light map with the same red pins, labels in ' +
            'English (Poland, Germany, Ukraine, Spain, Italy, Türkiye, Iraq).',
    },
};
