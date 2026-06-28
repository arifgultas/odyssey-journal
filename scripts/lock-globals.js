// Lock standard globals to prevent Expo's winter runtime from overriding them with lazy getters (which causes async require scope errors in Jest)
global.__DEV__ = true;

const globalsToLock = [
    '__ExpoImportMetaRegistry',
    'URL',
    'URLSearchParams',
    'TextDecoder',
    'TextDecoderStream',
    'TextEncoderStream',
    'structuredClone',
];

for (const name of globalsToLock) {
    const existing = global[name];
    try {
        Object.defineProperty(global, name, {
            value: existing || (name === '__ExpoImportMetaRegistry' ? { url: 'file:///mock.bundle.js' } : undefined),
            configurable: false,
            writable: true,
            enumerable: true,
        });
    } catch (e) {
        // Ignore if already non-configurable
    }
}
