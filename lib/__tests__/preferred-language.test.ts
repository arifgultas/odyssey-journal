/**
 * Tests for ProfileService.syncPreferredLanguage: the profile column (push notifications) and the
 * account metadata (Supabase's confirmation / password reset emails)
 */

jest.mock('../supabase', () => {
    const eq = jest.fn(() => Promise.resolve({ error: null }));
    const update = jest.fn(() => ({ eq }));
    return {
        supabase: {
            auth: {
                getUser: jest.fn(),
                updateUser: jest.fn(() => Promise.resolve({ data: {}, error: null })),
            },
            from: jest.fn(() => ({ update })),
        },
    };
});

jest.mock('../sentry', () => ({
    captureError: jest.fn(),
}));

jest.mock('../image-upload', () => ({ uploadImage: jest.fn() }));

import { ProfileService } from '../profile-service';
import { supabase } from '../supabase';

const signedIn = (metadata: Record<string, unknown>) =>
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'u1', user_metadata: metadata } },
        error: null,
    });

describe('syncPreferredLanguage', () => {
    beforeEach(() => jest.clearAllMocks());

    it('records the language on the profile and in the account metadata', async () => {
        signedIn({ language: 'en' });
        await ProfileService.syncPreferredLanguage('tr');

        expect(supabase.from).toHaveBeenCalledWith('profiles');
        expect(supabase.auth.updateUser).toHaveBeenCalledWith({ data: { language: 'tr' } });
    });

    it('fills the metadata for accounts that signed up before it was recorded', async () => {
        signedIn({ full_name: 'Ada' });
        await ProfileService.syncPreferredLanguage('ja');

        expect(supabase.auth.updateUser).toHaveBeenCalledWith({ data: { language: 'ja' } });
    });

    it('leaves the metadata alone when it already matches', async () => {
        signedIn({ language: 'de' });
        await ProfileService.syncPreferredLanguage('de');

        expect(supabase.auth.updateUser).not.toHaveBeenCalled();
    });

    it('does nothing when signed out', async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null }, error: null });
        await ProfileService.syncPreferredLanguage('fr');

        expect(supabase.from).not.toHaveBeenCalled();
        expect(supabase.auth.updateUser).not.toHaveBeenCalled();
    });
});
