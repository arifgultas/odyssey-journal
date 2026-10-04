import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { clearUserQueryCache } from '../query-persister';

describe('clearUserQueryCache', () => {
    it('empties the in-memory cache and removes the copy on disk', async () => {
        const client = new QueryClient();
        client.setQueryData(['profile', 'current'], { id: 'previous-user' });

        await clearUserQueryCache(client);

        expect(client.getQueryData(['profile', 'current'])).toBeUndefined();
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('REACT_QUERY_OFFLINE_CACHE');
    });
});
