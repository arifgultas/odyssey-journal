import { mapAppLink } from '@/lib/deep-links';

// Expo Router calls this for every incoming link, at launch and while the app runs
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
    try {
        return mapAppLink(path);
    } catch {
        return path;
    }
}
