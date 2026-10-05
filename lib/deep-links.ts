/**
 * App links: odysseyjournal://post/<id>, /user/<id>, /collection/<id>. The website's "open in the
 * app" banner uses the post form. The path names differ from the route files, so they are mapped
 * here before Expo Router resolves them (app/+native-intent.tsx); otherwise the router first shows
 * its generated "Unmatched Route" screen.
 *
 * Shared post links, https://odysseyjournal.app/[<lang>/]p/<id> (lib/share.ts), reach the app as
 * universal links / App Links (app.config.ts), either as the full address or as the path alone.
 */
const ROUTES: Record<string, string> = {
    post: '/post-detail',
    user: '/user-profile',
    collection: '/collection',
};

const SITE_ORIGIN = /^https?:\/\/(?:www\.)?odysseyjournal\.app(?=[/?#]|$)/i;
const SHARED_POST = /^\/(?:[a-z]{2}\/)?p\/([^/?#]+)/;

export function mapAppLink(path: string): string {
    const shared = path.replace(SITE_ORIGIN, '').match(SHARED_POST);
    if (shared) return `${ROUTES.post}/${shared[1]}`;

    const withoutScheme = path.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^\/+/, '');
    const match = withoutScheme.match(/^(post|user|collection)\/([^/?#]+)/);
    if (!match) return path;
    return `${ROUTES[match[1]]}/${match[2]}`;
}
