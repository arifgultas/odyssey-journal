import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Root HTML layout for web export.
 * Provides proper head tags for SEO, fonts, and responsive viewport.
 */
export default function Root({ children }: PropsWithChildren) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, shrink-to-fit=no"
                />

                {/* SEO */}
                <title>Odyssey Journal — Discover, Share, Inspire</title>
                <meta
                    name="description"
                    content="Odyssey Journal is a travel journaling app. Discover incredible routes, share your travel memories, and inspire fellow travelers around the world."
                />
                <meta name="theme-color" content="#F5F1E8" />

                {/* Open Graph / Social */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Odyssey Journal" />
                <meta
                    property="og:description"
                    content="Discover incredible routes, share your travel memories, and inspire fellow travelers."
                />
                <meta property="og:image" content="/assets/images/icon.png" />

                {/* Fonts — Google Fonts used in the app */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:wght@400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />

                {/* Expo Router scroll reset */}
                <ScrollViewStyleReset />

                {/* Web-specific styles */}
                <style dangerouslySetInnerHTML={{ __html: webStyles }} />
            </head>
            <body>{children}</body>
        </html>
    );
}

const webStyles = `
    body {
        overflow: hidden;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    #root {
        display: flex;
        flex: 1;
        height: 100vh;
    }
    /* Responsive container for web — max-width for readability */
    @media (min-width: 768px) {
        #root {
            max-width: 480px;
            margin: 0 auto;
            box-shadow: 0 0 60px rgba(0, 0, 0, 0.08);
        }
    }
    /* Scrollbar styling */
    ::-webkit-scrollbar {
        width: 6px;
    }
    ::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.15);
        border-radius: 3px;
    }
    /* Remove tap highlight on mobile web */
    * {
        -webkit-tap-highlight-color: transparent;
    }
    /* Disable text selection on interactive elements */
    button, [role="button"] {
        -webkit-user-select: none;
        user-select: none;
    }
`;
