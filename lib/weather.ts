/**
 * Weather Service
 * Open-Meteo API kullanarak hava durumu verisi çeker
 * Ücretsiz ve API key gerektirmez
 */

export interface WeatherData {
    temperature: number;      // Celsius
    weatherCode: number;      // WMO weather code
    condition: string;        // "Clear", "Partly cloudy", etc.
    icon: string;             // Ionicons icon name
}

// WMO Weather Codes to condition and icon mapping
// condition values are translation keys (weather.*)
const WEATHER_CODE_MAP: Record<number, { condition: string; icon: string }> = {
    0: { condition: 'clear', icon: 'sunny' },
    1: { condition: 'mainlyClear', icon: 'sunny' },
    2: { condition: 'partlyCloudy', icon: 'partly-sunny' },
    3: { condition: 'overcast', icon: 'cloudy' },
    45: { condition: 'foggy', icon: 'cloudy' },
    48: { condition: 'depositingRimeFog', icon: 'cloudy' },
    51: { condition: 'lightDrizzle', icon: 'rainy' },
    53: { condition: 'moderateDrizzle', icon: 'rainy' },
    55: { condition: 'denseDrizzle', icon: 'rainy' },
    56: { condition: 'freezingDrizzle', icon: 'snow' },
    57: { condition: 'denseFreezingDrizzle', icon: 'snow' },
    61: { condition: 'slightRain', icon: 'rainy' },
    63: { condition: 'moderateRain', icon: 'rainy' },
    65: { condition: 'heavyRain', icon: 'rainy' },
    66: { condition: 'freezingRain', icon: 'snow' },
    67: { condition: 'heavyFreezingRain', icon: 'snow' },
    71: { condition: 'slightSnow', icon: 'snow' },
    73: { condition: 'moderateSnow', icon: 'snow' },
    75: { condition: 'heavySnow', icon: 'snow' },
    77: { condition: 'snowGrains', icon: 'snow' },
    80: { condition: 'slightRainShowers', icon: 'rainy' },
    81: { condition: 'moderateRainShowers', icon: 'rainy' },
    82: { condition: 'violentRainShowers', icon: 'thunderstorm' },
    85: { condition: 'slightSnowShowers', icon: 'snow' },
    86: { condition: 'heavySnowShowers', icon: 'snow' },
    95: { condition: 'thunderstorm', icon: 'thunderstorm' },
    96: { condition: 'thunderstormSlightHail', icon: 'thunderstorm' },
    99: { condition: 'thunderstormHeavyHail', icon: 'thunderstorm' },
};

/**
 * Fetch current weather data for given coordinates
 * Uses Open-Meteo API (free, no API key required)
 */
export async function fetchWeatherData(
    latitude: number,
    longitude: number
): Promise<WeatherData | null> {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url, {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error('Weather API error:', response.status);
            return null;
        }

        const data = await response.json();

        const temperature = Math.round(data.current.temperature_2m);
        const weatherCode = data.current.weather_code;
        const weatherInfo = WEATHER_CODE_MAP[weatherCode] || { condition: 'unknown', icon: 'cloudy' };

        return {
            temperature,
            weatherCode,
            condition: weatherInfo.condition,
            icon: weatherInfo.icon,
        };
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error('Weather API timeout');
        } else {
            console.error('Error fetching weather:', error);
        }
        return null;
    }
}

/**
 * Get weather icon name for Ionicons based on weather code
 */
export function getWeatherIcon(weatherCode: number): string {
    return WEATHER_CODE_MAP[weatherCode]?.icon || 'cloudy';
}

/**
 * Get weather condition text based on weather code
 */
export function getWeatherCondition(weatherCode: number): string {
    return WEATHER_CODE_MAP[weatherCode]?.condition || 'unknown';
}

/**
 * Legacy condition string to translation key mapping
 * Used to convert old database values to new translation keys
 */
const LEGACY_CONDITION_MAP: Record<string, string> = {
    'Clear': 'clear',
    'Mainly Clear': 'mainlyClear',
    'Partly Cloudy': 'partlyCloudy',
    'Overcast': 'overcast',
    'Foggy': 'foggy',
    'Depositing Rime Fog': 'depositingRimeFog',
    'Light Drizzle': 'lightDrizzle',
    'Moderate Drizzle': 'moderateDrizzle',
    'Dense Drizzle': 'denseDrizzle',
    'Freezing Drizzle': 'freezingDrizzle',
    'Dense Freezing Drizzle': 'denseFreezingDrizzle',
    'Slight Rain': 'slightRain',
    'Moderate Rain': 'moderateRain',
    'Heavy Rain': 'heavyRain',
    'Freezing Rain': 'freezingRain',
    'Heavy Freezing Rain': 'heavyFreezingRain',
    'Slight Snow': 'slightSnow',
    'Moderate Snow': 'moderateSnow',
    'Heavy Snow': 'heavySnow',
    'Snow Grains': 'snowGrains',
    'Slight Rain Showers': 'slightRainShowers',
    'Moderate Rain Showers': 'moderateRainShowers',
    'Violent Rain Showers': 'violentRainShowers',
    'Slight Snow Showers': 'slightSnowShowers',
    'Heavy Snow Showers': 'heavySnowShowers',
    'Thunderstorm': 'thunderstorm',
    'Thunderstorm with Slight Hail': 'thunderstormSlightHail',
    'Thunderstorm with Heavy Hail': 'thunderstormHeavyHail',
    'Unknown': 'unknown',
};

/**
 * Convert a condition string (either legacy or new format) to a translation key
 * This ensures backward compatibility with existing database records
 */
export function getWeatherTranslationKey(condition: string): string {
    // Check if it's already a camelCase key
    if (condition && !condition.includes(' ') && condition[0] === condition[0].toLowerCase()) {
        return condition;
    }
    // Convert legacy format to translation key
    return LEGACY_CONDITION_MAP[condition] || 'unknown';
}

