/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Book-inspired warm palette
        primary: '#2C1810',      // Dark brown (main text)
        secondary: '#8B7355',    // Medium brown
        accent: '#D4A574',       // Gold/tan accent
        compass: '#4A6FA5',      // Compass/navigation color (reused for links, map markers, info)
        info: '#4A6FA5',         // Teal blue (links, map markers)
        background: '#F5F1E8',   // Cream/parchment
        surface: '#FFFFFF',      // White (cards)
        text: '#2C1810',         // Dark brown text
        muted: '#A89984',        // Muted brown
        border: '#E8DCC8',       // Light tan border

        // Status colors
        success: '#6B8E23',      // Olive green
        error: '#8B4513',        // Saddle brown
        warning: '#DAA520',      // Goldenrod
      },
      fontFamily: {
        // Serif fonts for book-like feel
        heading: ['PlayfairDisplay-Bold', 'serif'],
        body: ['Lora-Regular', 'serif'],
        bodyBold: ['Lora-Bold', 'serif'],
        accent: ['Merriweather-Regular', 'serif'],
        // Sans-serif for UI elements
        sans: ['Inter-Regular', 'sans-serif'],
        sansBold: ['Inter-Bold', 'sans-serif'],
      },
      fontSize: {
        // Typography scale
        'display': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em' }],
        'h1': ['36px', { lineHeight: '44px', letterSpacing: '-0.01em' }],
        'h2': ['28px', { lineHeight: '36px', letterSpacing: '0' }],
        'h3': ['24px', { lineHeight: '32px', letterSpacing: '0' }],
        'body-lg': ['18px', { lineHeight: '28px', letterSpacing: '0.01em' }],
        'body': ['16px', { lineHeight: '26px', letterSpacing: '0.01em' }],
        'body-sm': ['14px', { lineHeight: '22px', letterSpacing: '0' }],
        'caption': ['12px', { lineHeight: '18px', letterSpacing: '0.02em' }],
      },
    },
  },
  plugins: [],
}

