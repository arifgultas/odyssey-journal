/**
 * Store screenshot headlines and order. `ios` / `android` name the finished job used for each
 * platform (Map and Profile have real Android captures because they show the platform's map).
 * Line breaks are set by hand (\n) so no headline ends on a single orphaned word.
 * The first three are the ones people see in search results. Mirrored in FINALIZE.md (A3).
 */
module.exports = [
    {
        name: 'feed',
        ios: 'feed-dark-en',
        android: 'feed-dark-en',
        en: "See the world through\ntravelers' eyes",
        tr: 'Dünyayı gezginlerin\ngözünden gör',
    },
    {
        name: 'profile',
        ios: 'profile-dark-en',
        android: 'profile-light-android-en',
        en: 'Your passport,\nstamped with memories',
        tr: 'Anılarla damgalanmış\npasaportun',
    },
    {
        name: 'map',
        ios: 'map-dark-en',
        android: 'map-light-android-en',
        en: "Pin every place\nyou've been",
        tr: 'Gittiğin her yeri\nharitana işle',
    },
    {
        name: 'explore',
        ios: 'explore-dark-en-fix',
        android: 'explore-dark-en-fix',
        en: 'Find your next\ndestination',
        tr: 'Sıradaki rotanı\nkeşfet',
    },
    {
        name: 'city',
        ios: 'city-dark-en',
        android: 'city-dark-en',
        en: 'Every city,\ntold by travelers',
        tr: 'Her şehir,\ngezginlerin kaleminden',
    },
    {
        name: 'new-post',
        ios: 'newpost-dark-en',
        android: 'newpost-dark-en',
        en: 'Turn photos into\ntravel stories',
        tr: 'Fotoğraflarını seyahat\nhikâyesine dönüştür',
    },
    {
        name: 'messages',
        ios: 'letters-dark-en',
        android: 'letters-dark-en',
        en: 'Plan the next trip\ntogether',
        tr: 'Sonraki yolculuğu\nbirlikte planla',
    },
    {
        name: 'settings',
        ios: 'settings-dark-en',
        android: 'settings-dark-en',
        en: 'Your journal,\nin 12 languages',
        tr: 'Günlüğün,\n12 dilde',
    },
];
