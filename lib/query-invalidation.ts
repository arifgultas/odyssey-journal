import type { QueryClient } from '@tanstack/react-query';

/**
 * After a post is created, edited or deleted: every cached list or count that can contain it.
 * Without this the profile tab, other profiles and the popular / category / destination screens
 * kept showing deleted posts (and tapping one bounced back with an error) or the old version.
 */
export function invalidatePostQueries(client: QueryClient): void {
    feedStale = true;
    for (const queryKey of [['posts'], ['profile'], ['trending'], ['popular'], ['search', 'posts']]) {
        client.invalidateQueries({ queryKey });
    }
}

// The home feed keeps its pages in component state, not in the query cache. It reloads from the top
// only when a post changed (or nothing beyond the first page is loaded), so coming back from a post
// no longer throws away the pages the reader had scrolled through.
let feedStale = false;

/** True once after a post was created, edited or deleted */
export function consumeFeedStale(): boolean {
    const stale = feedStale;
    feedStale = false;
    return stale;
}
