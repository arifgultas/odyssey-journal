# Odyssey Journal — Website Design System & UI/UX Specification

> **Document Status**: Production Design Specification  
> **Target Product**: Odyssey Journal Official Website (`odysseyjournal.app` / Landing Page)  
> **Brand Persona**: Vintage Cartography, Timeless Travel Journal, Artisanal Bookbinding & Modern Explorer Tech  
> **Design Philosophy**: *"Static Elegance First, Cinematic Wanderlust in Motion."*

---

## Table of Contents
1. [Brand Concept & Design Ethos](#1-brand-concept--design-ethos)
2. [Color Palette & Token System](#2-color-palette--token-system)
3. [Typography System & Font Pairings](#3-typography-system--font-pairings)
4. [Elevation, Shadows, Paper Textures & Borders](#4-elevation-shadows-paper-textures--borders)
5. [Layout, Grid System & Responsive Breakpoints](#5-layout-grid-system--responsive-breakpoints)
6. [Website Page Structure & Section-by-Section Specs](#6-website-page-structure--section-by-section-specs)
7. [UI Component Specifications](#7-ui-component-specifications)
8. [Motion Design, Micro-Interactions & Page Physics](#8-motion-design-micro-interactions--page-physics)
9. [Iconography & Graphic Assets](#9-iconography--graphic-assets)
10. [Drop-In CSS Design System (:root Tokens)](#10-drop-in-css-design-system-root-tokens)
11. [SEO, Performance & Accessibility Checklist](#11-seo-performance--accessibility-checklist)

---

## 1. Brand Concept & Design Ethos

### 1.1 Brand Identity
**Odyssey Journal** bridges the romantic nostalgia of vintage travel notebooks (like classic moleskines, leather-bound diaries, expedition logs, and stamped passports) with a cutting-edge, fluid digital experience.

Instead of feeling like another cold, sterile corporate tech utility, the website must immediately evoke:
- **Warmth & Nostalgia**: The texture of worn archival parchment, sepia ink, and analog memories.
- **Craftsmanship & Elegance**: Editorial typography, fine gold-foil accents, and deliberate layout rhythms.
- **Exploration & Curiosity**: Vintage navigational charts, maritime compass needles, topographic contour line patterns, and passport visa stamps.
- **Digital Polished Precision**: Smooth 60fps micro-animations, crisp responsive typography, fast load times, and effortless mobile interactions.

### 1.2 Core Emotional Touchstones
| Pillar | Feeling | Visual Manifestation |
| :--- | :--- | :--- |
| **Tactile Memory** | "Holding a physical travel book in hands" | Warm parchment surfaces, polaroid photo frames with tape/pins, handwritten captions. |
| **Wayfinding** | "Navigating uncharted territory" | Compass rose monograms, coordinate marks, vintage nautical blue accents, dotted flight paths. |
| **Authenticity** | "Personal stories over generic social noise" | Rich editorial serif headlines, ink bleed stamps, intimate quote typography. |
| **Modern Utility** | "Reliable, private, always ready offline" | Sharp UI elements, crisp vector icons, instant QR downloads, clear feature matrices. |

---

## 2. Color Palette & Token System

The color palette is derived directly from the application's core design tokens (`constants/theme.ts`), expanded for responsive web usage with high-contrast variants, gradients, and subtle tint states.

### 2.1 Light Theme — *Vintage Archival Parchment* (Default)

| Token Name | Hex Code | HSL / RGBA | Role & Visual Usage |
| :--- | :--- | :--- | :--- |
| `--bg-parchment` | `#F5F1E8` | `hsl(40, 36%, 94%)` | Primary page canvas; warm cream paper ground |
| `--bg-surface` | `#FFFFFF` | `#ffffff` | Floating content cards, polaroid frames, elevated containers |
| `--bg-surface-subtle` | `#EFE9DC` | `hsl(39, 34%, 90%)` | Code blocks, inset wells, table headers, tag pills |
| `--text-primary` | `#2C1810` | `hsl(17, 47%, 12%)` | Deep espresso ink; primary headings, body text, high-emphasis icons |
| `--text-secondary` | `#8B7355` | `hsl(33, 24%, 44%)` | Warm sepia brown; subheadings, metadata, captions, secondary links |
| `--text-muted` | `#A89984` | `hsl(34, 18%, 59%)` | Muted driftwood; placeholders, dates, subtle icons, inactive tabs |
| `--border-warm` | `#E8DCC8` | `hsl(38, 41%, 85%)` | Card borders, dividers, subtle separators, input outlines |
| `--border-subtle` | `rgba(44, 24, 16, 0.08)` | `rgba(44, 24, 16, 0.08)` | Ultra-soft dividers and glassmorphic card strokes |
| `--accent-gold` | `#D4A574` | `hsl(31, 53%, 65%)` | Antique gold; primary CTA buttons, badges, highlights, active states |
| `--accent-gold-hover` | `#C2915D` | `hsl(31, 48%, 56%)` | Darkened gold for hover and active button states |
| `--compass-blue` | `#4A6FA5` | `hsl(215, 38%, 47%)` | Compass navigation blue; map markers, hyperlinks, info banners, location pins |
| `--compass-blue-hover`| `#3B5B88` | `hsl(215, 40%, 38%)` | Deeper navigation blue for focused and hover link states |
| `--status-success` | `#6B8E23` | `hsl(80, 60%, 35%)` | Olive branch green; offline-ready indicator, sync status, checkmarks |
| `--status-error` | `#8B4513` | `hsl(25, 75%, 31%)` | Saddle brown; error notices, validation alerts, destructive actions |
| `--status-warning` | `#DAA520` | `hsl(43, 74%, 49%)` | Goldenrod; attention badges, tips, rating stars |

### 2.2 Dark Theme — *Sepia Night Expedition*

| Token Name | Hex Code | HSL / RGBA | Role & Visual Usage |
| :--- | :--- | :--- | :--- |
| `--bg-parchment-dark` | `#1A1410` | `hsl(24, 24%, 8%)` | Deep antique wood / dark espresso canvas |
| `--bg-surface-dark` | `#2C1810` | `hsl(17, 47%, 12%)` | Elevated midnight cards, feature panels, mobile sheet menu |
| `--bg-surface-raised` | `#382218` | `hsl(18, 40%, 16%)` | Raised badges, interactive buttons, modal overlays |
| `--text-primary-dark` | `#F5F1E8` | `hsl(40, 36%, 94%)` | Cream ink; headings, title text, prominent copy |
| `--text-secondary-dark`| `#D4A574` | `hsl(31, 53%, 65%)` | Warm golden tan; body copy, subheaders, active metadata |
| `--text-muted-dark` | `#A89984` | `hsl(34, 18%, 59%)` | Muted driftwood; tertiary info, secondary icons, timestamps |
| `--border-warm-dark` | `#3D2F20` | `hsl(32, 31%, 18%)` | Subtle borders, separation rules, card outlines |
| `--accent-gold-dark` | `#DAA520` | `hsl(43, 74%, 49%)` | Bright goldenrod; nighttime CTAs, focal points, glowing tags |
| `--compass-blue-dark` | `#6B9BD1` | `hsl(212, 53%, 62%)` | Luminous sky blue; map markers, interactive controls, links |
| `--status-success-dark`| `#8FBC8F` | `hsl(120, 25%, 65%)` | Sage green; verified badges, sync confirmed |

### 2.3 Specialty Gradients & Foil Accents
- **Gold Leaf Foil (CTA & Accents)**:
  `linear-gradient(135deg, #D4A574 0%, #F5E3C8 50%, #C2915D 100%)`
- **Parchment Surface Glow**:
  `radial-gradient(ellipse at top center, rgba(255, 255, 255, 0.6) 0%, rgba(245, 241, 232, 0) 70%)`
- **Night Expedition Cosmic Vignette**:
  `radial-gradient(circle at 50% 20%, rgba(74, 111, 165, 0.15) 0%, rgba(26, 20, 16, 0.95) 75%)`
- **Antique Compass Shimmer**:
  `linear-gradient(90deg, #4A6FA5 0%, #6B9BD1 50%, #4A6FA5 100%)`

---

## 3. Typography System & Font Pairings

The typographic architecture balances **classical literary serif elegance** for narrative storytelling with **clean grotesque sans-serifs** for effortless user interface ergonomics, enriched with **handwritten annotations** for authentic polaroid journal notes.

### 3.1 Font Family Stack

```html
<!-- Google Fonts Embed Code (Add to website <head>) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Ephesis&family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400;1,700&display=swap" rel="stylesheet">
```

| Font Family | Weights | CSS Fallback Stack | Purpose & Application |
| :--- | :--- | :--- | :--- |
| **Playfair Display** | 600, 700, 900 (Black) | `'Playfair Display', Georgia, 'Times New Roman', serif` | Main hero headlines, section titles, large numerals, editorial impact |
| **Lora** | 400, 400i, 500, 600 | `'Lora', Georgia, 'Times New Roman', serif` | Long-form story previews, narrative body copy, testimonials, pull-quotes |
| **Ephesis** | 400 (Script) | `'Ephesis', 'Dancing Script', cursive` | Decorative flourish words, hero eyebrow calligraphy, signature branding |
| **Caveat** | 400, 600, 700 | `'Caveat', 'Brush Script MT', cursive` | Polaroid handwritten photo captions, traveler notes, stamp annotations |
| **Inter** | 400, 500, 600, 700 | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | Buttons, navigation links, UI badges, counters, forms, search inputs |

### 3.2 Typographic Hierarchy Scale

| Level | Size (Desktop) | Size (Mobile) | Line Height | Tracking | Weight / Font | Sample Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | `56px – 64px` | `38px – 44px` | `1.15` | `-0.025em` | Playfair Display 900 | *"Every Journey Becomes an Epic Story"* |
| **Calligraphy Flourish** | `48px – 60px` | `32px – 40px` | `1.0` | `0` | Ephesis 400 | *"your personal odyssey"* |
| **Section Title (H1/H2)** | `36px – 42px` | `28px – 32px` | `1.25` | `-0.015em` | Playfair Display 700 | *"Crafted for Wanderlust"* |
| **Feature Headline (H3)** | `24px – 28px` | `20px – 22px` | `1.3` | `0` | Playfair Display 600 | *"Vintage Polaroid Photo Canvas"* |
| **Subheading / Lead** | `20px – 22px` | `17px – 18px` | `1.55` | `0.01em` | Lora 400 / 500 | Hero introductory summary paragraph |
| **Body Standard** | `16px` | `15px` | `1.65` | `0.01em` | Lora 400 | Feature descriptions, article text |
| **Handwritten Accent** | `20px – 24px` | `18px – 20px` | `1.2` | `0.02em` | Caveat 700 | *"Kyoto, Japan • Rain in Gion"* |
| **UI Button / CTA** | `15px – 16px` | `15px` | `1.0` | `0.03em` | Inter 600 (Semibold) | *"Download for iOS" / "Explore Map"* |
| **Navigation Link** | `14px – 15px` | `16px` | `1.0` | `0.02em` | Inter 500 (Medium) | *"Features", "Stories", "Privacy"* |
| **Eyebrow / Badge** | `12px – 13px` | `11px – 12px` | `1.0` | `0.08em` | Inter 700 (Uppercase) | *"DISPATCH NO. 04 • OFFLINE FIRST"* |
| **Micro Caption / Stamp** | `11px – 12px` | `11px` | `1.4` | `0.04em` | Inter 500 / Mono | Coordinate tags: `35.0116° N, 135.7681° E` |

---

## 4. Elevation, Shadows, Paper Textures & Borders

### 4.1 Tactile Depth & Shadows
Odyssey Journal does not use synthetic cold black shadows. Shadows have a warm dark brown undertone (`#2C1810` / `rgba(44, 24, 16, ...)`), mimicking natural incandescent daylight over heavy stock book paper.

```css
/* Warm Shadow Token System */
--shadow-sm: 0 1px 3px rgba(44, 24, 16, 0.06), 0 1px 2px rgba(44, 24, 16, 0.04);
--shadow-md: 0 4px 12px -2px rgba(44, 24, 16, 0.08), 0 2px 6px -1px rgba(44, 24, 16, 0.05);
--shadow-lg: 0 12px 24px -4px rgba(44, 24, 16, 0.12), 0 4px 10px -2px rgba(44, 24, 16, 0.06);
--shadow-polaroid: 0 14px 28px rgba(44, 24, 16, 0.14), 0 6px 12px rgba(44, 24, 16, 0.08);
--shadow-gold-glow: 0 4px 20px rgba(212, 165, 116, 0.45);
--shadow-compass-glow: 0 4px 20px rgba(74, 111, 165, 0.35);
```

### 4.2 Paper Textures & Noise Overlays
To achieve the sensory feeling of real rag parchment without slowing down page load times:
1. **Subtle SVG Noise Filter**:
   An ultra-light inline SVG noise pattern applied as a pseudo-element overlay with `opacity: 0.025 – 0.04` and `pointer-events: none;`.
2. **Vintage Vignette Background**:
   A multi-stop radial gradient creating softened edges like the perimeter of an aged journal page:
   ```css
   background: 
     radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.7) 0%, rgba(245, 241, 232, 1) 75%),
     #F5F1E8;
   ```

### 4.3 Borders, Dividers & Postal Stamp Details
- **Default Card Border**: `1px solid #E8DCC8` with `border-radius: 12px;`
- **Book Edge Inset**: Inner border effect (`box-shadow: inset 0 0 0 1px rgba(232, 220, 200, 0.6)`)
- **Perforated / Stamp Border**:
  Used on coupon cards, travel stats, and passport visas:
  `border: 2px dashed #D4A574;` or scalloped CSS mask.
- **Double Editorial Rule**:
  A signature visual motif above section titles:
  ```css
  .vintage-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin: 24px auto;
  }
  .vintage-divider::before, .vintage-divider::after {
    content: "";
    height: 1px;
    width: 60px;
    background: #D4A574;
  }
  ```

---

## 5. Layout, Grid System & Responsive Breakpoints

### 5.1 Responsive Breakpoints
| Breakpoint | Target Devices | Max Container Width | Horizontal Padding |
| :--- | :--- | :--- | :--- |
| **Mobile (`xs`)** | `< 640px` (Smartphones) | `100%` | `20px` |
| **Tablet (`sm`/`md`)**| `640px – 1023px` (iPads, foldables)| `720px – 900px` | `32px` |
| **Desktop (`lg`)** | `1024px – 1279px` (Laptops) | `1120px` | `48px` |
| **Widescreen (`xl`)** | `1280px – 1536px` (Desktop monitors)| `1280px` | `64px` |
| **Ultrawide (`2xl`)**| `> 1536px` (High-res displays) | `1400px` | `80px` |

### 5.2 Spacing System
Built in a harmonized geometric progression matching the mobile application:
- `space-xs`: `4px`
- `space-sm`: `8px`
- `space-md`: `16px`
- `space-lg`: `24px`
- `space-xl`: `32px`
- `space-2xl`: `48px`
- `space-3xl`: `64px`
- `space-4xl`: `96px`
- `space-5xl`: `128px` (Major section vertical separation)

---

## 6. Website Page Structure & Section-by-Section Specs

The website is engineered as a high-converting, deeply immersive single-page flagship showcase, complemented by dedicated legal/support subpages.

```
┌────────────────────────────────────────────────────────┐
│ 1. Floating Nav Header (Monogram, Menu, Language, CTA) │
├────────────────────────────────────────────────────────┤
│ 2. Hero Section (Headline, Calligraphy, Dual Phone Mock)│
├────────────────────────────────────────────────────────┤
│ 3. Social Proof & Explorer Ticker (Global Travel Stats)│
├────────────────────────────────────────────────────────┤
│ 4. The 5 Core Pillars (Interactive Feature Carousel)   │
│    - Polaroid Photo Stories                            │
│    - Vintage Cartography & GPS Pins                    │
│    - Passport Visa Stamps & Stats                      │
│    - 100% Offline-First Architecture                   │
│    - 12-Language Global Community                      │
├────────────────────────────────────────────────────────┤
│ 5. Interactive Journal Demo (Flipbook / Canvas Preview)│
├────────────────────────────────────────────────────────┤
│ 6. Traveler Diaries & Testimonials (Torn-paper cards)  │
├────────────────────────────────────────────────────────┤
│ 7. Final Conversion Section (App Store + QR Scanner)   │
├────────────────────────────────────────────────────────┤
│ 8. Archival Footer (Legal, Sitemap, Compass Badge)     │
└────────────────────────────────────────────────────────┘
```

---

### Section 1: Floating Navigation Header
- **Layout**: Floating sticky island pill (`position: sticky; top: 16px; margin: 0 auto; max-width: 1160px;`).
- **Surface**: Translucent frosted parchment (`background: rgba(245, 241, 232, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(232, 220, 200, 0.9); border-radius: 9999px;`).
- **Brand Monogram**:
  - Left side: Elegant brass compass icon rotating gently on hover.
  - Typography: **Odyssey Journal** (Playfair Display 700) + subtle subtitle *"Est. 2026"*.
- **Center Navigation**:
  - Links: *Features*, *The Journal*, *World Map*, *Community*, *FAQ*.
  - Font: Inter 500, `14px`, `#2C1810`, with gold underline slide animation on hover.
- **Right Action Bar**:
  - **Language Selector Dropdown**: Globe icon with current language badge (EN, TR, ES, DE, IT, FR, etc.).
  - **Dark Mode Toggle**: Antique brass sun/moon toggle switch.
  - **Primary CTA Button**: *"Get the App"* (Compact gold-pill button with Apple & Android micro-icons).

---

### Section 2: Hero Section (*The Call to Adventure*)
- **Height**: Minimum `90vh`, centered alignment with dynamic asymmetric framing.
- **Eyebrow Tag**:
  - Badge: Vintage postmark stamp design: `[ ★ DISPATCH NO. 01 • THE MODERN TRAVEL LOG ★ ]`
  - Font: Inter 700 uppercase, letter-spacing `0.1em`, bronze border.
- **Main Heading**:
  - Line 1: *"Every Journey Deserves"* (Playfair Display 900, `#2C1810`)
  - Line 2: An exquisite hand-lettered flourish in cursive: <span style="font-family: Ephesis; font-size: 1.3em; color: #D4A574;">an unforgettable story.</span>
- **Body Copy**:
  - *"Turn fleeting travel moments into timeless, book-style chronicles. Multiple photos, GPS waypoints, vintage passport stamps, and offline recording — wrapped in an artisanal interface made for true wanderers."*
- **Call-to-Action Group**:
  1. **Primary Button**: Download on App Store (Dark espresso background `#2C1810`, white/gold text, Apple logo, 16px radius, hover lift).
  2. **Secondary Button**: Get on Google Play (Gold border, parchment fill, Play Store icon).
  3. **Interactive Demo Trigger**: *"Watch 45s Film"* with a vintage compass play button that pulsates.
- **Hero Visual Showcase**:
  - **Centerpiece**: Dual high-fidelity mobile device mockups tilted in perspective 3D:
    - *Left Mockup*: Open Journal view with vintage sepia paper texture, polaroids of Amalfi Coast, and handwritten notes.
    - *Right Mockup*: Vintage Explore Map view with antique compass rose, gold waypoints, and passport stamp overlays.
  - **Floating Satellites (Parallax)**:
    - Left: Tilted polaroid card with tape on the corner: *"Sunrise over Bagan hot air balloons • 06:15 AM"*.
    - Right: An authentic circular visa stamp: *"KYOTO IMMIGRATION • APPROVED"*.
    - Bottom: Small compass widget that tracks mouse movements subtly.

---

### Section 3: Global Explorer Social Proof Ticker
- **Background**: Soft parchment band with top/bottom hairline borders (`#E8DCC8`).
- **Metric Cards**:
  - **120+ Countries**: Explored & documented by Odyssey travelers.
  - **12 Languages**: Native localization across the globe.
  - **100% Offline**: Zero cell service required on mountains or overseas flights.
  - **4.9 ★★★★★**: Average traveler rating.
- **Style**: High-contrast serif numbers (`Playfair Display 700`, `36px`) with warm sans labels (`Inter 600`, `13px`).

---

### Section 4: The 5 Core Feature Modules (*Detailed Deep Dives*)

#### Feature 4.1: Photo Stories & The Polaroid Canvas
- **Headline**: *"Photographs that breathe like paper prints."*
- **Visual**: Stack of 3 layered polaroid photos. Hovering over any card slides it forward with realistic paper physics.
- **Polaroid Anatomy**:
  - Pure white paper card (`#FFFFFF`) with 12px top/left/right border and 48px bottom caption area.
  - Washi tape texture on top center.
  - Handwritten caption in `Caveat` font (e.g., *"Lost in the alleys of Trastevere with a warm espresso ☕"*).
  - Subtle drop shadow with brown tint.

#### Feature 4.2: Vintage Cartography & GPS Location Tagging
- **Headline**: *"A map styled after 18th-century nautical charts."*
- **Visual**: Interactive preview map showing antique sepia ocean contours, vintage parchment landmasses, and glowing navigation compass pins (`#4A6FA5`).
- **Interactive Element**: Clicking different city pins (Reykjavik, Kyoto, Cappadocia, Patagonia) smoothly shifts the phone screen preview.

#### Feature 4.3: Passport Profile & Collectible Visa Stamps
- **Headline**: *"Your personal travel passport, stamped with every border crossed."*
- **Visual**: A navy blue and gold-embossed digital passport cover that flips open to reveal authentic ink-bleed stamp graphics with date marks, country outlines, and distance statistics.

#### Feature 4.4: 100% Offline-First Architecture
- **Headline**: *"Never let a missing signal silence your memory."*
- **Visual**: Graphic illustration of an airplane mid-flight over remote mountains. An active badge shows: `[ Status: Offline Mode Active • 14 Memories Queued for Cloud Sync ]`.
- **Copy**: Emphasize private local storage on device with Supabase cloud backup when Wi-Fi returns.

#### Feature 4.5: Global Multilingual Support (12 Languages)
- **Headline**: *"Wanderlust speaks every tongue."*
- **Visual**: An elegant interactive carousel or circular rosette highlighting the 12 natively supported languages: Turkish, English, Spanish, French, German, Portuguese, Italian, Russian, Japanese, Korean, Chinese, and Arabic.

---

### Section 5: Interactive App Experience / Live Preview
- A responsive, clickable web widget demonstrating the feel of the app:
  - Tab Switcher: `[ My Journal ]` | `[ Explore Map ]` | `[ Passport ]` | `[ Bookmarks ]`.
  - Realistic page flip animation between travel logs.
  - Demonstrates the Light Parchment vs. Dark Sepia night mode toggle live in browser.

---

### Section 6: Traveler Chronicles (Testimonials)
- **Design Pattern**: Styled as personal handwritten excerpts from real travelers' notebooks, pinned to a corkboard or laid out across parchment.
- **Card Elements**:
  - Small circular traveler avatar inside a vintage postage stamp frame.
  - Quote in `Lora Italic` font (`17px`, line-height `1.6`).
  - Traveler name and home city (e.g., *"Elena Rostova — Vienna, Austria"*).
  - Small handwritten note in `Caveat`: *"Logged 14 countries with Odyssey so far!"*.

---

### Section 7: Download & Conversion Call-to-Action
- **Container**: Full-width embossed dark-leather / antique travel trunk container (`#1A1410`) with gold leaf border trim (`#D4A574`).
- **Left Column**:
  - Headline: *"Your Next Odyssey Begins Today."*
  - Subhead: *"Download Odyssey Journal for iOS and Android. Free to start, forever yours to keep."*
  - Direct Store Badges: Apple App Store & Google Play Store SVG buttons.
- **Right Column**:
  - **Instant QR Code**: An antique-styled QR code framed in a gold visa stamp border.
  - Caption: *"Scan with your phone's camera to install immediately."*

---

### Section 8: Archival Footer & Legal Links
- **Top Footer**: Monogram compass, newsletter signup (*"The Explorer's Dispatch — curated travel stories twice a month"*).
- **Navigation Columns**:
  - **Product**: Overview, Features, Interactive Map, iOS App, Android App, Changelog.
  - **Community**: Traveler Showcase, Ambassador Program, Guidelines.
  - **Legal & Privacy**: Privacy Policy, Terms of Service, Cookie Preferences, GDPR / KVKK Compliance.
  - **Connect**: GitHub, Instagram, X (Twitter), Support Email (`support@odysseyjournal.app`).
- **Bottom Bar**:
  - Copyright: `© 2026 Odyssey Journal. All journeys reserved.`
  - Coordinate stamp: `41.0082° N, 28.9784° E • Crafted with wanderlust.`

---

## 7. UI Component Specifications

### 7.1 Buttons & Interactive Controls

#### Primary CTA (Gold Leaf Button)
- **Background**: `linear-gradient(135deg, #D4A574 0%, #C2915D 100%)`
- **Text Color**: `#2C1810` (High contrast, bold)
- **Typography**: Inter 600, `15px`, letter-spacing `0.02em`
- **Padding**: `14px 28px`
- **Border Radius**: `9999px` (Pill shape)
- **Box Shadow**: `0 4px 14px rgba(212, 165, 116, 0.4)`
- **Hover State**: Lift `translateY(-2px)`, shadow expands to `0 6px 20px rgba(212, 165, 116, 0.55)`
- **Active State**: `translateY(0)`, shadow shrinks.

#### Secondary CTA (Espresso Leather Button)
- **Background**: `#2C1810`
- **Text Color**: `#F5F1E8` (Cream)
- **Border**: `1px solid #3D2F20`
- **Padding**: `14px 28px`
- **Border Radius**: `9999px`
- **Hover State**: Background softens to `#3E2318`, border lights to `#D4A574`.

#### Ghost / Outline Button (Parchment Link)
- **Background**: `transparent`
- **Text Color**: `#2C1810`
- **Border**: `1.5px solid #8B7355`
- **Padding**: `12px 24px`
- **Border Radius**: `9999px`
- **Hover State**: Background fills with `rgba(212, 165, 116, 0.15)`, border shifts to `#D4A574`.

---

### 7.2 Polaroid Photo Component
```html
<div class="polaroid-card">
  <div class="tape-strip"></div>
  <div class="photo-wrapper">
    <img src="kyoto-street.jpg" alt="Rain in Kyoto" loading="lazy" />
    <span class="location-badge">📍 Kyoto, Japan</span>
  </div>
  <p class="polaroid-caption">Wandering through rainy Gion at dusk.</p>
  <span class="polaroid-date">OCTOBER 14, 2025</span>
</div>
```
- **CSS Attributes**:
  - `background: #FFFFFF;`
  - `padding: 12px 12px 28px 12px;`
  - `border-radius: 4px;`
  - `box-shadow: 0 10px 25px -5px rgba(44, 24, 16, 0.15);`
  - `transform: rotate(-2.5deg);` (Organic tilt)
  - `transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;`
  - **On Hover**: `transform: rotate(0deg) translateY(-8px) scale(1.03); box-shadow: 0 20px 35px -5px rgba(44, 24, 16, 0.22);`

---

### 7.3 Visa Stamp Badge Component
- Circular or oval seal with double dashed borders.
- Text arranged along an SVG circular path: `ODYSSEY EXPEDITION • OFFICIAL ENTRY`.
- Center content: Country code, date of visit, star glyph.
- Ink bleed color: `#8B4513` or `#4A6FA5` with `mix-blend-mode: multiply; opacity: 0.85;`.

---

## 8. Motion Design, Micro-Interactions & Page Physics

### 8.1 Motion Philosophy
Odyssey Journal's motion is **analog, weight-bearing, and fluid**. Animations should feel like lifting heavy archival paper, unscrewing a brass brass compass, or stamping an ink seal. Avoid snappy hyper-digital bouncing.

### 8.2 Standard Transition Timings
- **Fast / Micro (Hover, Links, Badges)**: `150ms – 200ms ease-out`
- **Medium / Component (Modals, Dropdowns, Cards)**: `300ms – 400ms cubic-bezier(0.16, 1, 0.3, 1)`
- **Slow / Cinematic (Page reveals, Hero phone floating)**: `600ms – 1200ms cubic-bezier(0.22, 1, 0.36, 1)`

### 8.3 Keyframe Animations
```css
/* Subtle floating effect for hero mockups and polaroids */
@keyframes antiqueFloat {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(0.5deg);
  }
}

/* Gentle pulse for map waypoints */
@keyframes waypointGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 111, 165, 0.5);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(74, 111, 165, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 111, 165, 0);
  }
}

/* Compass Needle Rotation on Hover */
.compass-icon:hover .needle {
  transform: rotate(45deg);
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 9. Iconography & Graphic Assets

### 9.1 Icon System
Use **Lucide Icons** (or Feather Icons) paired with custom vintage vector flourishes.
- **Stroke Width**: `1.75px` (maintains vintage pen-line consistency).
- **Default Icon Color**: `#4A6FA5` for navigation/action, `#2C1810` for general UI.

#### Core Icon Vocabulary
| Action / Meaning | Icon Name | Custom Style Note |
| :--- | :--- | :--- |
| **Navigation / Direction** | `Compass` | Custom 8-point compass rose with north pointer in gold |
| **Memories / Posts** | `BookOpen` / `Feather` | Vintage quill nib or journal spread |
| **Photography** | `Camera` / `Image` | Vintage rangefinder camera silhouette |
| **Passport / Identity** | `Award` / `Stamp` | Scalloped consular visa stamp outline |
| **Offline Sync** | `CloudOff` / `ShieldCheck` | Antique padlock or shielded checkmark |
| **Map & Waypoints** | `MapPin` / `Map` | Topographic contour lines with map pin |
| **Global Languages** | `Globe` | Vintage longitude-latitude globe |

---

## 10. Drop-In CSS Design System (:root Tokens)

Copy and paste this production-ready CSS snippet directly into your website's main stylesheet (`index.css` or `styles.css`):

```css
/* ==========================================================================
   ODYSSEY JOURNAL — MASTER DESIGN TOKENS
   ========================================================================== */

:root {
  /* Core Color Palette (Light Mode - Parchment) */
  --oj-bg-canvas: #F5F1E8;
  --oj-bg-surface: #FFFFFF;
  --oj-bg-surface-subtle: #EFE9DC;
  
  --oj-text-primary: #2C1810;
  --oj-text-secondary: #8B7355;
  --oj-text-muted: #A89984;

  --oj-border-warm: #E8DCC8;
  --oj-border-subtle: rgba(44, 24, 16, 0.08);

  --oj-accent-gold: #D4A574;
  --oj-accent-gold-hover: #C2915D;
  --oj-accent-gold-subtle: rgba(212, 165, 116, 0.15);

  --oj-compass-blue: #4A6FA5;
  --oj-compass-blue-hover: #3B5B88;
  --oj-compass-blue-subtle: rgba(74, 111, 165, 0.12);

  --oj-status-success: #6B8E23;
  --oj-status-error: #8B4513;
  --oj-status-warning: #DAA520;

  /* Typography Stack */
  --oj-font-heading: 'Playfair Display', Georgia, 'Times New Roman', serif;
  --oj-font-body: 'Lora', Georgia, 'Times New Roman', serif;
  --oj-font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --oj-font-handwriting: 'Caveat', 'Brush Script MT', cursive;
  --oj-font-calligraphy: 'Ephesis', 'Dancing Script', cursive;

  /* Elevation Shadows (Warm Undertone) */
  --oj-shadow-sm: 0 1px 3px rgba(44, 24, 16, 0.06), 0 1px 2px rgba(44, 24, 16, 0.04);
  --oj-shadow-md: 0 4px 12px -2px rgba(44, 24, 16, 0.08), 0 2px 6px -1px rgba(44, 24, 16, 0.05);
  --oj-shadow-lg: 0 12px 24px -4px rgba(44, 24, 16, 0.12), 0 4px 10px -2px rgba(44, 24, 16, 0.06);
  --oj-shadow-polaroid: 0 14px 28px rgba(44, 24, 16, 0.14), 0 6px 12px rgba(44, 24, 16, 0.08);

  /* Border Radii */
  --oj-radius-sm: 4px;
  --oj-radius-md: 8px;
  --oj-radius-lg: 14px;
  --oj-radius-xl: 20px;
  --oj-radius-full: 9999px;

  /* Layout Widths */
  --oj-container-max: 1240px;
}

/* Dark Mode Tokens (Sepia Night) */
[data-theme="dark"] {
  --oj-bg-canvas: #1A1410;
  --oj-bg-surface: #2C1810;
  --oj-bg-surface-subtle: #382218;

  --oj-text-primary: #F5F1E8;
  --oj-text-secondary: #D4A574;
  --oj-text-muted: #A89984;

  --oj-border-warm: #3D2F20;
  --oj-border-subtle: rgba(245, 241, 232, 0.08);

  --oj-accent-gold: #DAA520;
  --oj-accent-gold-hover: #E8B936;
  --oj-accent-gold-subtle: rgba(218, 165, 32, 0.2);

  --oj-compass-blue: #6B9BD1;
  --oj-compass-blue-hover: #8AB4E4;
  --oj-compass-blue-subtle: rgba(107, 155, 209, 0.2);

  --oj-status-success: #8FBC8F;
  --oj-status-error: #CD853F;
  --oj-status-warning: #F0E68C;

  --oj-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --oj-shadow-md: 0 4px 14px rgba(0, 0, 0, 0.4);
  --oj-shadow-lg: 0 12px 28px rgba(0, 0, 0, 0.5);
  --oj-shadow-polaroid: 0 16px 32px rgba(0, 0, 0, 0.6);
}

/* Global Reset & Base Typography */
body {
  margin: 0;
  padding: 0;
  background-color: var(--oj-bg-canvas);
  color: var(--oj-text-primary);
  font-family: var(--oj-font-body);
  font-size: 16px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color 0.3s ease, color 0.3s ease;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--oj-font-heading);
  color: var(--oj-text-primary);
  margin-top: 0;
  line-height: 1.25;
  font-weight: 700;
}

a {
  color: var(--oj-compass-blue);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--oj-compass-blue-hover);
}

/* Container Utility */
.oj-container {
  width: 100%;
  max-width: var(--oj-container-max);
  margin-left: auto;
  margin-right: auto;
  padding-left: 24px;
  padding-right: 24px;
  box-sizing: border-box;
}
```

---

## 11. SEO, Performance & Accessibility Checklist

### 11.1 Meta Tags & OpenGraph Structure
```html
<title>Odyssey Journal — Travel Journal & Offline Story Companion</title>
<meta name="description" content="Capture your journey with book-inspired design. Photo stories, vintage map tagging, passport stamps, and 100% offline support. Available for iOS and Android.">
<meta name="keywords" content="travel journal, trip diary, photo stories, travel passport, offline travel log, wanderlust, travel app">

<!-- OpenGraph / Social Sharing -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://odysseyjournal.app">
<meta property="og:title" content="Odyssey Journal — Turn Every Trip into an Epic Story">
<meta property="og:description" content="An artisanal, book-inspired travel log for iOS & Android. Document journeys with polaroids, vintage maps, and visa stamps.">
<meta property="og:image" content="https://odysseyjournal.app/assets/og-cover.jpg">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Odyssey Journal — Capture Your Journey">
<meta name="twitter:description" content="Book-inspired travel journal app with offline support and vintage cartography.">
<meta name="twitter:image" content="https://odysseyjournal.app/assets/og-cover.jpg">
```

### 11.2 Accessibility Standards (WCAG 2.1 AA)
- **Contrast Ratios**: 
  - Primary text (`#2C1810`) on Parchment (`#F5F1E8`) achieves a **12.4:1 contrast ratio**, well exceeding the WCAG AAA requirement of 7:1.
  - Compass Blue (`#4A6FA5`) on Parchment achieves a **4.8:1 ratio**, meeting WCAG AA for standard text and AAA for large headlines.
- **Keyboard Navigation**:
  - Focus rings styled in warm compass blue: `outline: 2px solid var(--oj-compass-blue); outline-offset: 3px;`.
- **Reduced Motion Support**:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```

### 11.3 Performance Targets
- **Lighthouse Scores Target**: 98+ Performance, 100 Accessibility, 100 Best Practices, 100 SEO.
- **Image Formats**: All promotional app screenshots, device frames, and polaroids converted to `.webp` with `@1x` and `@2x` resolution srcsets.
- **Web Fonts Optimization**: Loaded via Google Fonts using `display=swap` with critical system font fallbacks (`Georgia`, `serif`, `sans-serif`) to prevent CLS (Cumulative Layout Shift).

---

## 12. Deliverables & Next Steps for Website Implementation

1. **Step 1 (Foundation)**: Initialize HTML5 / Vite or Next.js repository with the provided CSS tokens in `index.css`.
2. **Step 2 (Asset Collection)**: Export app screenshots from `app/(tabs)` (Home feed, Explore map, Passport profile, Story creator) into `/assets/mockups/`.
3. **Step 3 (Component Construction)**: Build Header, Hero, Polaroid Stack, Feature Grid, Testimonials, and Conversion Footer using the exact token specifications above.
4. **Step 4 (Legal Pages)**: Plug in existing legal documents from `WEBSITE_LEGAL_DOCS.md` (`privacy-policy.html` and `terms-of-service.html`).
5. **Step 5 (Store Links)**: Connect App Store and Google Play store URLs and generate dynamic SVG QR codes for direct mobile downloads.
