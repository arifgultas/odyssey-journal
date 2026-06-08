import { z } from 'zod';
import { captureError } from './sentry';

const envSchema = z.object({
    EXPO_PUBLIC_SUPABASE_URL: z.string().url('EXPO_PUBLIC_SUPABASE_URL must be a valid URL'),
    EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10, 'EXPO_PUBLIC_SUPABASE_ANON_KEY must be a valid API key'),
    EXPO_PUBLIC_SENTRY_DSN: z.string().url('EXPO_PUBLIC_SENTRY_DSN must be a valid URL').optional().or(z.literal('')),
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(5, 'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY must be valid').optional().or(z.literal('')),
});

export function validateEnv() {
    const envData = {
        EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
        EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
        EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    };

    const result = envSchema.safeParse(envData);

    if (!result.success) {
        const errorMessages = result.error.errors
            .map((err) => `- ${err.path.join('.')}: ${err.message}`)
            .join('\n');

        const errorMsg = `Invalid environment variables:\n${errorMessages}`;
        console.error(errorMsg);

        const error = new Error(errorMsg);
        try {
            captureError(error, { context: 'EnvValidation' });
        } catch (e) {
            // Sentry might not be initialized yet
        }

        // Fails fast to prevent silent connection issues on incorrect credentials
        throw error;
    }

    return result.data;
}
