import { Alert, Platform, Share } from 'react-native';
import { t } from './i18n';
import { siteUrl } from './legal-links';

export interface SharePostData {
    title: string;
    message: string;
    url?: string;
}

/**
 * Share a post using native share dialog
 */
export async function sharePost(data: SharePostData): Promise<boolean> {
    try {
        // Construct share message
        const shareMessage = data.url
            ? `${data.message}\n\n${data.url}`
            : data.message;

        // For web, use Web Share API if available
        if (Platform.OS === 'web' && navigator.share) {
            await navigator.share({
                title: data.title,
                text: data.message,
                url: data.url,
            });
            return true;
        }

        // For native platforms, use React Native Share
        const result = await Share.share({
            title: data.title,
            message: shareMessage,
            ...(Platform.OS === 'ios' && data.url ? { url: data.url } : {}),
        });

        if (result.action === Share.sharedAction) {
            return true;
        } else if (result.action === Share.dismissedAction) {
            return false;
        }

        return false;
    } catch (error) {
        console.error('Error sharing post:', error);
        Alert.alert(t('common.error'), t('errors.shareFailed'));
        return false;
    }
}

/**
 * Generate shareable post URL
 */
export function generatePostShareUrl(postId: string): string {
    // Without the app this lands on the site's /p/<id> page (store links, "open in the app"; the site
    // never shows posts itself). With the app installed the same address opens the post in the app
    // (universal link / App Link, app.config.ts). In the sharer's language.
    return siteUrl(`/p/${encodeURIComponent(postId)}`);
}

/**
 * Get share message for a post
 */
export function getPostShareMessage(postTitle: string, postContent?: string): string {
    if (postContent) {
        const preview = postContent.length > 100
            ? postContent.substring(0, 100) + '...'
            : postContent;
        return `${postTitle}\n\n${preview}`;
    }
    return postTitle;
}
