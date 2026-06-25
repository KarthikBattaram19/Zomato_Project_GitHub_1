---
name: AI Discovery System
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1b1b1b'
  on-surface-variant: '#5b403f'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8f6f6e'
  outline-variant: '#e4bebc'
  surface-tint: '#bb162c'
  primary: '#b7122a'
  on-primary: '#ffffff'
  primary-container: '#db313f'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb3b1'
  secondary: '#006c48'
  on-secondary: '#ffffff'
  secondary-container: '#7cf7bc'
  on-secondary-container: '#00714b'
  tertiary: '#805200'
  on-tertiary: '#ffffff'
  tertiary-container: '#a16900'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b1'
  on-primary-fixed: '#410007'
  on-primary-fixed-variant: '#92001c'
  secondary-fixed: '#7ff9be'
  secondary-fixed-dim: '#62dca4'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005235'
  tertiary-fixed: '#ffddb4'
  tertiary-fixed-dim: '#ffb955'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#633f00'
  background: '#fcf9f8'
  on-background: '#1b1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar_width: 320px
  gutter: 24px
  margin_mobile: 16px
  margin_desktop: 32px
  stack_gap_sm: 8px
  stack_gap_md: 16px
  stack_gap_lg: 24px
---

## Brand & Style

This design system is built for a high-velocity, intelligence-driven restaurant discovery experience. The personality is energetic yet precise, blending the established trust of a global food brand with the innovative, assistive nature of modern AI. 

The aesthetic follows a **Corporate / Modern** approach with subtle **Minimalist** influences. It prioritizes clarity and rapid information processing. The user interface should feel light, airy, and responsive, using high-quality white space to separate intense data points like ratings and price tiers. AI-driven components are distinguished by a softer, warmer surface treatment to feel more "human" and conversational compared to standard utility elements.

## Colors

The palette is anchored by a high-energy primary red, used for critical actions and brand presence. Success and warning colors are reserved for qualitative data—specifically restaurant ratings and availability status. 

The AI-specific accent color (`#FFF8F0`) acts as a semantic signal; it should be used for background containers where the AI is "speaking" or providing rationale for a recommendation. This distinguishes machine-generated insights from static database information. Grayscale values are strictly mapped to ensure accessible contrast ratios on the `#FAFAFA` background.

## Typography

The system utilizes **Inter** across all levels to maintain a systematic, utilitarian aesthetic that excels in data-heavy environments. 

Headlines use bold weights and tighter letter spacing to create a strong visual anchor for restaurant names. Body text scales down to 14px for density in lists, while labels use semi-bold weights to ensure metadata (like "Open Now" or price indicators) remains legible at small sizes. Mobile overrides are required for display and large headline roles to prevent awkward line breaks in narrow viewports.

## Layout & Spacing

This design system uses a **Split-Pane Fluid Grid** model. 

- **Desktop:** A fixed 320px sidebar houses the AI filters and preference sliders, while the main content area flexes to fill the remaining width. Use a 24px gutter between cards in the results grid.
- **Mobile:** The layout collapses into a single column. The sidebar transforms into a bottom-sheet drawer or a top-level expandable "Filter" bar. 
- **Rhythm:** Spacing follows an 8px base unit. Use `stack_gap_md` (16px) for internal card padding and `stack_gap_lg` (24px) for section vertical spacing.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Ambient Shadows**. 

The base background is the lowest level (`#FAFAFA`). Interactive cards and surfaces sit at a "Resting" elevation with a very soft, 4% opacity neutral shadow. Upon hover, cards should transition to a "Raised" state, increasing shadow spread and decreasing opacity to 8% to simulate physical lift. 

AI-generated content blocks should not use shadows; instead, they use the `ai_accent_hex` fill to create depth through color rather than simulated light, signaling a different "type" of information.

## Shapes

The design system uses a **Rounded** shape language to appear approachable and modern. 

- **Cards & Buttons:** Use a base 12px radius (`rounded-lg` in this system).
- **Chips & Tags:** Use a fully circular radius (Pill-shaped) to distinguish them from actionable buttons.
- **Input Fields:** Match the 12px button radius to maintain a consistent horizontal rhythm in forms.
- **Images:** All restaurant thumbnails must carry the 12px corner radius to prevent visual tension against rounded card containers.

## Components

### Buttons
- **Primary:** High-contrast `#E23744` background with white text. 12px radius.
- **Segmented:** Use a ghost-toggle style with a subtle grey border. The active segment takes a neutral black background with white text.

### Chips
- **Rating Chips:** Use `#1BA672` (Green) for 4.0+, `#F5A623` (Orange) for 3.0-3.9. 
- **Filter Chips:** Pill-shaped with a 1px border. When active, fill with the primary red at 10% opacity and a solid red border.

### Cards
- **Restaurant Card:** White background, 12px radius, subtle shadow. Internal padding of 16px. AI rationales ("Why you'll like this") are appended to the bottom of the card on a `#FFF8F0` footer strip.

### Input & Controls
- **Sliders:** Use a thick track with the primary red for the active range. Include a floating badge above the thumb showing the current value (e.g., "$$ - $$$").
- **Search:** Large, 12px rounded input with a prominent "Ask AI" icon prefix in the primary brand color.