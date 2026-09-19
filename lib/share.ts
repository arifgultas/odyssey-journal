import { Alert, Platform, Share } from 'react-native';
import { t } from './i18n';

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
    // The site is a static marketing page with no login, so it will never show posts; /post/<id>
    // was a 404. The home page is where the store links are. The id rides along only so a future
    // universal link / App Link can open the post in the app for people who have it installed.
    return `https://odysseyjournal.app/?post=${encodeURIComponent(postId)}`;
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
