import { Alert, Platform, Share } from 'react-native';

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
        });

        if (result.action === Share.sharedAction) {
            return true;
        } else if (result.action === Share.dismissedAction) {
            return false;
        }

        return false;
    } catch (error) {
        console.error('Error sharing post:', error);
        Alert.alert('Error', 'Failed to share post');
        return false;
    }
}

/**
 * Generate shareable post URL
 */
export function generatePostShareUrl(postId: string): string {
    // Uses the app's deep link scheme defined in app.config.ts
    return `odysseyjournal://post/${postId}`;
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
