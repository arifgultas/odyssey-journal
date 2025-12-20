import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react-native';
import React from 'react';

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    }

    return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Wait for async operations to complete
 */
export const waitFor = async (callback: () => void, timeout = 1000) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        try {
            callback();
            return;
        } catch (error) {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }
    throw new Error('Timeout waiting for condition');
};

/**
 * Create a mock navigation object
 */
export const createMockNavigation = () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
    reset: jest.fn(),
    setParams: jest.fn(),
    dispatch: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    addListener: jest.fn(),
    removeListener: jest.fn(),
});

/**
 * Create a mock route object
 */
export const createMockRoute = (params = {}) => ({
    key: 'test-route',
    name: 'TestScreen',
    params,
});

// Re-export everything from testing library
export * from '@testing-library/react-native';
