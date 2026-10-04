/**
 * App links: odysseyjournal://post/<id>, /user/<id>, /collection/<id>. The website's "open in the
 * app" banner uses the post form. The path names differ from the route files, so they are mapped
 * here before Expo Router resolves them (app/+native-intent.tsx); otherwise the router first shows
 * its generated "Unmatched Route" screen.
 */
const ROUTES: Record<string, string> = {
    post: '/post-detail',
    user: '/user-profile',
    collection: '/collection',
};

export function mapAppLink(path: string): string {
    const withoutScheme = path.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^\/+/, '');
    const match = withoutScheme.match(/^(post|user|collection)\/([^/?#]+)/);
    if (!match) return path;
    return `${ROUTES[match[1]]}/${match[2]}`;
}
