# USJR Alumni Project Design System

## Overview
This document outlines the core styling conventions, color palettes, and structural layouts governing the USJR Alumni Platform.

## Color Palette

### Primary System
- **USJR Green (`#1a5f3f`)**: The anchor of the platform. Used for primary call-to-action buttons, active navigation states, primary branding headers, and status badges (e.g., successful actions or important links).
- **USJR Green Prominent Hover (`#154e33` to `#2d7a4f`)**: Applied universally to give deep affordance feedback.
- **Gold Accent (`#d4af37`)**: Reserved strictly for high-priority secondary/tertiary engagement, noticeably the `"Donate"` button. Its high contrast against Green makes it stand out without overpowering the theme.
- **Gold Hover (`#c19b2a`)**: Feedback state for Gold accent items.

### Secondary & Neutrals
- **Background Tones**: Elements sit on very bright, low-noise backgrounds (`#f9fafb` or `bg-gray-50`) and pure White (`#ffffff` or `bg-white`) inside cards. This ensures typography pops immediately off the page and content takes center stage.
- **Typography Base**: High-contrast grays (`text-gray-900` `#1f2937`) for headers. Mid-tone grays (`text-gray-600` / `700`) for body text, guaranteeing accessibility reading standards.
- **Borders & Dividers**: Subdued dividing borders (`border-gray-100` / `border-gray-200`) prevent sections from bleeding into each other.

## Typography & Iconography
- **Font Face**: The system leans on generic system-sans interfaces (`font-sans`), taking advantage of clean native rendering.
- **Weights**: Heavy uses of `font-bold` for segment headers and `font-semibold` for buttons create strong demarcations in the document flow.
- **Icons**: Lucide React drives the iconography. Using a consistent 2px stroke creates a soft but precise line language, bridging paragraphs of text seamlessly (e.g., event properties: `<Calendar />`, `<MapPin />`, `<Users />`).

## UX & Layout Patterns
- **Responsive Architecture**: The frontend respects mobile contexts heavily. Native desktop layouts utilize wide containers (`max-w-6xl`) with sticky `TopBar` implementations. Mobile delegates dense navigation to the `MegaMenu`, which implicitly manages its open/close state upon interaction.
- **Card-Driven Feed**: Community content (Bulletins, Events) applies a consistent "floating card" motif (`bg-white rounded-lg shadow-md`). Interactions enhance this (`hover:shadow-xl hover:scale-105`), creating a dynamic, reactive application surface.
- **Dashboard Consistency**: Administratative sections isolate themselves into full-height workspace environments with a persistent locked navigation slider and a smoothly scrolling unified content column. Floating Action Buttons (FABs) provide rapid "scroll-to-top" access.
- **Active Feedback**: The UI never leaves the user guessing. Notifications for pending statuses use unmistakable warning colors (`bg-yellow-100 text-yellow-800`), matching standardized color feedback conventions.
