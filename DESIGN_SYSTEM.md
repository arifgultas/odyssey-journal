# Odyssey Journal - Design System

## Overview
A **Book-Inspired Premium Design System** for a travel journal app that feels warm, elegant, and timeless.

**Strategy**: *Static Beauty first. Motion later.*

---

## Color Palette

### Light Mode (Primary)

#### Primary Colors
- **Primary**: `#2C1810` - Dark brown (main text, headings)
- **Secondary**: `#8B7355` - Medium brown (secondary text)
- **Accent**: `#D4A574` - Gold/tan accent (highlights, CTAs)
- **Compass**: `#4A6FA5` - Compass/navigation color (links, map markers, info icons)

#### Backgrounds
- **Background**: `#F5F1E8` - Cream/parchment (main background)
- **Surface**: `#FFFFFF` - White (cards, modals)

#### Text
- **Text**: `#2C1810` - Dark brown
- **Text Secondary**: `#8B7355` - Medium brown
- **Text Muted**: `#A89984` - Muted brown

#### UI Elements
- **Border**: `#E8DCC8` - Light tan
- **Divider**: `#E8DCC8` - Light tan

#### Status Colors
- **Success**: `#6B8E23` - Olive green
- **Error**: `#8B4513` - Saddle brown
- **Warning**: `#DAA520` - Goldenrod
- **Info**: `#4A6FA5` - Teal blue

### Dark Mode (Sepia/Parchment)

#### Primary Colors
- **Primary**: `#F5F1E8` - Cream
- **Secondary**: `#D4A574` - Gold/tan
- **Accent**: `#DAA520` - Goldenrod
- **Compass**: `#6B9BD1` - Lighter compass color

#### Backgrounds
- **Background**: `#1A1410` - Very dark brown
- **Surface**: `#2C1810` - Dark brown

#### Text
- **Text**: `#F5F1E8` - Cream
- **Text Secondary**: `#D4A574` - Gold/tan
- **Text Muted**: `#A89984` - Muted brown

#### UI Elements
- **Border**: `#3D2F20` - Dark tan
- **Divider**: `#3D2F20` - Dark tan

#### Status Colors
- **Success**: `#8FBC8F` - Light olive
- **Error**: `#CD853F` - Peru
- **Warning**: `#F0E68C` - Khaki
- **Info**: `#6B9BD1` - Light teal

---

## Typography

### Font Families

#### Serif (Book-like feel)
- **Heading**: `PlayfairDisplay-Bold` - For titles and headings
- **Heading Black**: `PlayfairDisplay-Black` - For display text
- **Body**: `Lora-Regular` - For body text
- **Body Bold**: `Lora-Bold` - For emphasis
- **Body Italic**: `Lora-Italic` - For quotes
- **Accent**: `Merriweather-Regular` - For special text
- **Accent Bold**: `Merriweather-Bold` - For emphasized special text

#### Sans-serif (UI elements)
- **UI**: `Inter-Regular` - For buttons, labels
- **UI Bold**: `Inter-Bold` - For emphasized UI

### Font Sizes & Line Heights

| Style      | Size | Line Height | Letter Spacing |
|------------|------|-------------|----------------|
| Display    | 48px | 56px        | -0.96px        |
| H1         | 36px | 44px        | -0.36px        |
| H2         | 28px | 36px        | 0              |
| H3         | 24px | 32px        | 0              |
| Body Large | 18px | 28px        | 0.18px         |
| Body       | 16px | 26px        | 0.16px         |
| Body Small | 14px | 22px        | 0              |
| Caption    | 12px | 18px        | 0.24px         |

---

## Spacing

- **XS**: `4px`
- **SM**: `8px`
- **MD**: `16px`
- **LG**: `24px`
- **XL**: `32px`
- **XXL**: `48px`

---

## Border Radius

- **SM**: `4px`
- **MD**: `8px`
- **LG**: `12px`
- **XL**: `16px`
- **Full**: `9999px` (circular)

---

## Shadows

### Small
```
shadowColor: #2C1810
shadowOffset: { width: 0, height: 1 }
shadowOpacity: 0.05
shadowRadius: 2
elevation: 1
```

### Medium
```
shadowColor: #2C1810
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.08
shadowRadius: 4
elevation: 2
```

### Large
```
shadowColor: #2C1810
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.12
shadowRadius: 8
elevation: 4
```

---

## Icon System

### Compass Icon Reuse
The **compass color** (`#4A6FA5` in light mode, `#6B9BD1` in dark mode) is used consistently for:
- Navigation icons
- Map markers
- Location pins
- Info icons
- Link indicators
- Directional elements

This creates a cohesive visual language where users associate this color with navigation and information.

---

## Components

### PaperBackground
Global texture wrapper that provides the warm parchment background.

**Variants**:
- `default`: Parchment background (`#F5F1E8`)
- `surface`: White card background (`#FFFFFF`)

### CustomToast
Themed feedback notifications replacing default alerts.

**Types**:
- `success`: Olive green with checkmark icon
- `error`: Saddle brown with close icon
- `warning`: Goldenrod with warning icon
- `info`: Teal blue with info icon

**Features**:
- Smooth slide-in animation
- Auto-hide after 3 seconds (configurable)
- Consistent with design system colors

---

## Usage Guidelines

### Do's ✅
- Use serif fonts for content (headings, body text)
- Use sans-serif fonts for UI elements (buttons, labels)
- Maintain consistent spacing using the spacing scale
- Use compass color for all navigation-related elements
- Apply appropriate shadows for depth
- Use CustomToast for user feedback

### Don'ts ❌
- Don't mix font families arbitrarily
- Don't use colors outside the defined palette
- Don't use generic alerts (use CustomToast instead)
- Don't ignore the spacing scale
- Don't use harsh shadows

---

## Implementation

All design tokens are defined in:
- **React Native**: `constants/theme.ts`
- **Tailwind CSS**: `tailwind.config.js`

Import and use consistently across the app:

```typescript
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
```

---

## Future Enhancements (Motion Later)

- Page transitions
- Micro-interactions
- Loading animations
- Gesture-based interactions
- Parallax effects

**Current Focus**: Establish static beauty and consistency first.
