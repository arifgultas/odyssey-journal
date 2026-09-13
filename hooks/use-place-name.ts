/**
 * Localized place name for a post, with the offline answer first.
 *
 * A card renders immediately from the bundled data (or from the raw stored name), and only a
 * place that data does not know is resolved in the background, after which the card upgrades
 * itself. The caches live in lib/place-names.ts - memory, AsyncStorage and the shared
 * `place_names` table - so a place is looked up once per app, not once per card.
 */
import { useEffect, useState } from 'react';

import { useLanguage } from '@/context/language-context';
import { getCountryAbbreviation } from '@/lib/i18n/place-data/country-abbr';
import { formatPostLocation, type PostLocationData } from '@/lib/location-formatter';
import {
    pickName,
    resolveFromGeneratedData,
    resolvePlaceNames,
    type LocalizedPlace,
} from '@/lib/place-names';

/**
 * The "City, CC" line for a post card in the viewer's language.
 *
 * @param location the post's stored location
 * @param fallbackTitle shown when the post has no usable location at all
 */
export function usePlaceName(location?: PostLocationData | null, fallbackTitle: string = ''): string {
    const { language } = useLanguage();
    const [resolved, setResolved] = useState<LocalizedPlace | null>(null);

    const city = location?.city?.trim() || '';
    const country = location?.country?.trim() || '';

    // Only worth a lookup when the post has a city that neither the post itself nor the
    // bundled data can already name.
    const needsLookup =
        !!city && !location?.localizedNames?.[language] && !resolveFromGeneratedData({ city, country });

    useEffect(() => {
        if (!needsLookup) {
            setResolved(null);
            return;
        }

        let cancelled = false;
        resolvePlaceNames({ city, country })
            .then((place) => {
                if (!cancelled) setResolved(place);
            })
            .catch(() => {
                // Offline: the stored name stays on screen
            });

        return () => {
            cancelled = true;
        };
    }, [city, country, needsLookup]);

    const offline = formatPostLocation(location, language, fallbackTitle);
    if (!resolved) return offline;

    const localizedCity = pickName(resolved, language);
    if (!localizedCity) return offline;

    const countryCode = location?.countryCode || resolved.countryCode;
    const abbreviation = countryCode ? getCountryAbbreviation(countryCode, language) : '';

    return abbreviation ? `${localizedCity}, ${abbreviation}` : localizedCity;
}

export default usePlaceName;
