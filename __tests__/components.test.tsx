/**
 * Component Tests
 * Verifies component files exist
 */

import * as fs from 'fs';
import * as path from 'path';

const componentsDir = path.join(__dirname, '..', 'components');

describe('Component Files Exist', () => {
    const componentFiles = [
        'themed-view.tsx',
        'themed-text.tsx',
        'animated-empty-state.tsx',
        'animated-fab.tsx',
        'animated-like-button.tsx',
        'animated-loading.tsx',
        'animated-post-card.tsx',
        'bookmark-ribbon.tsx',
        'post-card.tsx',
        'image-carousel.tsx',
        'skeleton-loader.tsx',
        'offline-indicator.tsx',
        'language-selector-modal.tsx',
        'edit-profile-modal.tsx',
        'report-modal.tsx',
        'profile-header.tsx',
        'comment-item.tsx',
        'comments-list.tsx',
    ];

    componentFiles.forEach(file => {
        it(`${file} exists`, () => {
            const filePath = path.join(componentsDir, file);
            expect(fs.existsSync(filePath)).toBe(true);
        });
    });
});
