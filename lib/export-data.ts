import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform, Share } from 'react-native';

/**
 * Gathers all user data and exports it as a JSON file
 * Complies with GDPR Right to Data Portability
 */
export async function exportUserData(t: any): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // 1. Fetch Profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // 2. Fetch Posts
        const { data: posts } = await supabase
            .from('posts')
            .select('*, comments(*)')
            .eq('user_id', user.id);

        // 3. Fetch Comments
        const { data: comments } = await supabase
            .from('comments')
            .select('*')
            .eq('user_id', user.id);

        // 4. Fetch Follows (Following & Followers)
        const { data: following } = await supabase
            .from('follows')
            .select('following_id, created_at')
            .eq('follower_id', user.id);

        const { data: followers } = await supabase
            .from('follows')
            .select('follower_id, created_at')
            .eq('following_id', user.id);

        // 5. Fetch Collections
        const { data: collections } = await supabase
            .from('collections')
            .select('*, collection_items(*)')
            .eq('user_id', user.id);

        // Assemble Data payload
        const exportPayload = {
            export_date: new Date().toISOString(),
            account: {
                id: user.id,
                email: user.email,
                profile: profile
            },
            data: {
                posts: posts || [],
                comments: comments || [],
                collections: collections || []
            },
            connections: {
                following: following || [],
                followers: followers || []
            }
        };

        const jsonString = JSON.stringify(exportPayload, null, 2);

        // For Web, trigger standard download
        if (Platform.OS === 'web') {
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `odyssey-journal-data-${user.id.substring(0, 8)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            return true;
        }

        // For Native, save to file system and share
        const fileName = `odyssey-data-${new Date().toISOString().split('T')[0]}.json`;
        const fileUri = `${(FileSystem as any).documentDirectory}${fileName}`;

        await FileSystem.writeAsStringAsync(fileUri, jsonString, {
            encoding: (FileSystem as any).EncodingType.UTF8
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json',
                dialogTitle: t('settings.exportDataTitle') || 'Download My Data'
            });
        } else {
            // Fallback for native if expo-sharing fails
            await Share.share({
                url: fileUri,
                title: 'Odyssey Journal Data Export'
            });
        }

        return true;
    } catch (error) {
        console.error('Error exporting user data:', error);
        Alert.alert(t('common.error') || 'Error', t('settings.exportError') || 'Failed to export data.');
        return false;
    }
}
