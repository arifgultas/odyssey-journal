import { useLanguage } from '@/context/language-context';
import { blockUser } from '@/lib/block';
import { invalidatePostQueries } from '@/lib/query-invalidation';
import { useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

/**
 * Block a user after a confirmation, from wherever their content appears (profile, post menu,
 * comment, chat). App Store 1.2 asks for blocking next to the content itself.
 */
export function useConfirmBlockUser() {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    return (userId: string, onBlocked?: () => void) => {
        Alert.alert(t('profile.blockUserTitle'), t('profile.blockUserDesc'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
                text: t('profile.block'),
                style: 'destructive',
                onPress: async () => {
                    try {
                        await blockUser(userId);
                        // Their posts, comments and profile disappear from every cached list
                        queryClient.invalidateQueries({ queryKey: ['search'] });
                        queryClient.invalidateQueries({ queryKey: ['suggested', 'users'] });
                        invalidatePostQueries(queryClient);
                        Alert.alert(t('common.success'), t('profile.blockSuccess'));
                        onBlocked?.();
                    } catch {
                        Alert.alert(t('common.error'), t('profile.blockError'));
                    }
                },
            },
        ]);
    };
}
