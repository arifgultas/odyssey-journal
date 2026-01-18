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
const WEATHER_CODE_MAP: Record<number, { condition: string; icon: string }> = {
    0: { condition: 'Clear', icon: 'sunny' },
    1: { condition: 'Mainly Clear', icon: 'sunny' },
    2: { condition: 'Partly Cloudy', icon: 'partly-sunny' },
    3: { condition: 'Overcast', icon: 'cloudy' },
    45: { condition: 'Foggy', icon: 'cloudy' },
    48: { condition: 'Depositing Rime Fog', icon: 'cloudy' },
    51: { condition: 'Light Drizzle', icon: 'rainy' },
    53: { condition: 'Moderate Drizzle', icon: 'rainy' },
    55: { condition: 'Dense Drizzle', icon: 'rainy' },
    56: { condition: 'Freezing Drizzle', icon: 'snow' },
    57: { condition: 'Dense Freezing Drizzle', icon: 'snow' },
    61: { condition: 'Slight Rain', icon: 'rainy' },
    63: { condition: 'Moderate Rain', icon: 'rainy' },
    65: { condition: 'Heavy Rain', icon: 'rainy' },
    66: { condition: 'Freezing Rain', icon: 'snow' },
    67: { condition: 'Heavy Freezing Rain', icon: 'snow' },
    71: { condition: 'Slight Snow', icon: 'snow' },
    73: { condition: 'Moderate Snow', icon: 'snow' },
    75: { condition: 'Heavy Snow', icon: 'snow' },
    77: { condition: 'Snow Grains', icon: 'snow' },
    80: { condition: 'Slight Rain Showers', icon: 'rainy' },
    81: { condition: 'Moderate Rain Showers', icon: 'rainy' },
    82: { condition: 'Violent Rain Showers', icon: 'thunderstorm' },
    85: { condition: 'Slight Snow Showers', icon: 'snow' },
    86: { condition: 'Heavy Snow Showers', icon: 'snow' },
    95: { condition: 'Thunderstorm', icon: 'thunderstorm' },
    96: { condition: 'Thunderstorm with Slight Hail', icon: 'thunderstorm' },
    99: { condition: 'Thunderstorm with Heavy Hail', icon: 'thunderstorm' },
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
        const weatherInfo = WEATHER_CODE_MAP[weatherCode] || { condition: 'Unknown', icon: 'cloudy' };

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
    return WEATHER_CODE_MAP[weatherCode]?.condition || 'Unknown';
}
