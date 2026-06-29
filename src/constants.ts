/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PricingPlan } from './types';

export const COLORS = {
  bg: '#030e06',
  cardBg: '#071e0f',
  cardGradientEnd: '#0c331a',
  cardBorder: 'rgba(0, 230, 118, 0.1)',
  darkGreen: '#1a5c32',
  brightGreen: '#00e676',
  red: '#ff0000',
  white: '#ffffff',
  gray: '#ffffff',
};

// Change this to match the sale name in your Google Sheet (e.g., "Flash Sale" or "Ramadan Mega Sale")
export const ACTIVE_SALE_NAME = "Flash Sale";

export const PLANS: PricingPlan[] = [
  {
    "id": "rise",
    "name": "Rise",
    "price": "59.99",
    "duration": "(01 month)"
  },
  {
    "id": "advance",
    "name": "Advance",
    "price": "164.99",
    "oldPrice": "229.99",
    "duration": "(lifetime)",
    "isFeatured": true
  },
  {
    "id": "pro",
    "name": "Pro",
    "price": "109.99",
    "oldPrice": "119.99",
    "duration": "(06 months)"
  }
];

// ─── Theme spec ───────────────────────────────────────────────────────────────
// accent        — main neon colour (title, price highlight, border glow)
// bg            — banner gradient stops [dark, lighter]
// outerShell    — solid fill of the outer SVG rect  (standard cards)
// innerGradStart— top colour of the radial gradient inside the inner rect
// innerStroke   — stroke colour of the inner border rect
// priceColor    — colour for the sale / new price text
// headerTextDark— true → featured card header text is #000 (light accent bg)
// ─────────────────────────────────────────────────────────────────────────────
export const THEMES: Record<string, {
  accent: string;
  bg: string[];
  outerShell: string;
  innerGradStart: string;
  innerStroke: string;
  priceColor: string;
  headerTextDark: boolean;
}> = {
  forex: {
    accent: '#00e676',
    bg: ['#030e06', '#0a2e16'],
    outerShell: '#007D43',
    innerGradStart: '#007044',
    innerStroke: '#0E7C51',
    priceColor: '#01F595',
    headerTextDark: false,
  },
  signals: {
    accent: '#00e676',
    bg: ['#030e06', '#0a2e16'],
    outerShell: '#007D43',
    innerGradStart: '#007044',
    innerStroke: '#0E7C51',
    priceColor: '#01F595',
    headerTextDark: false,
  },
  algo: {
    accent: '#00e676',
    bg: ['#020c08', '#04151a'],
    outerShell: '#007D43',
    innerGradStart: '#007044',
    innerStroke: '#0E7C51',
    priceColor: '#01F595',
    headerTextDark: false,
  },
  copier: {
    accent: '#00e676',
    bg: ['#030e06', '#0a2e16'],
    outerShell: '#007D43',
    innerGradStart: '#007044',
    innerStroke: '#0E7C51',
    priceColor: '#01F595',
    headerTextDark: false,
  },
  gold: {
    accent: '#ffca28',
    bg: ['#1a1400', '#332800'],
    outerShell: '#7a5c00',
    innerGradStart: '#4d3b00',
    innerStroke: '#8a6c00',
    priceColor: '#ffca28',
    headerTextDark: true,
  },
  indices: {
    accent: '#00ffff',
    bg: ['#000d0d', '#001a1a'],
    outerShell: '#003333',
    innerGradStart: '#002626',
    innerStroke: '#006666',
    priceColor: '#00ffff',
    headerTextDark: true,
  },
  raven: {
    accent: '#00ffff',
    bg: ['#000d0d', '#001a1a'],
    outerShell: '#003333',
    innerGradStart: '#002626',
    innerStroke: '#006666',
    priceColor: '#00ffff',
    headerTextDark: true,
  },
  combo: {
    accent: '#00ffff',
    bg: ['#030e06', '#001a1a'],
    outerShell: '#003333',
    innerGradStart: '#002626',
    innerStroke: '#006666',
    priceColor: '#00ffff',
    headerTextDark: true,
  },
  guardian: {
    accent: '#448aff',
    bg: ['#000a1a', '#001a33'],
    outerShell: '#001a40',
    innerGradStart: '#001433',
    innerStroke: '#1a5599',
    priceColor: '#448aff',
    headerTextDark: false,
  },
  product: {
    accent: '#e040fb',
    bg: ['#0f001a', '#1a0033'],
    outerShell: '#2a0a3d',
    innerGradStart: '#1a0533',
    innerStroke: '#4d1475',
    priceColor: '#e040fb',
    headerTextDark: false,
  },
};

export const DISCOUNT_LABEL_SIZE = 0.9;

export const LOGO_X_OFFSET = 0; // Negative move left, Positive move right (vw)
export const LOGO_Y_OFFSET = 0; // Negative move up, Positive move down (vw)

export const OLD_PRICE_COLOR = '#ffffff';
export const STRIKE_THROUGH_COLOR = '#ff0000';
export const DURATION_LABEL_COLOR = '#FFFFFF';
export const UP_TO_OFF_COLOR = '#FFFFFF';

export const FEATURED_HEADER_TEXT_COLOR = '#010a05';
export const STANDARD_HEADER_TEXT_COLOR = '#ffffff';

export const CARD_HEADER_FONT_SIZE = 1.7; // in vw units

export const TITLE_Y_OFFSET = 2.0; // Positive move down, Negative move up (vw)
export const TITLE_MAX_WIDTH = 100; // In percentage of its container (35% of banner)

export const SALE_NAME_X_OFFSET = -1.56; // Negative move left, Positive move right (vw) — ~20px at 1280px
export const SALE_NAME_Y_OFFSET = -1.39; // Negative move up, Positive move down (vw) — ~20px at 720px tall
export const SALE_NAME_MAX_HEIGHT = 15; // Max height of the sale name image in vw units

export const OLD_PRICE_FONT_SIZE = 2.6; // in vw units
export const NEW_PRICE_FONT_SIZE = 3.6; // in vw units

export const BANNER_LINE1_FONT_SIZE = 4.5; // in vw units
export const BANNER_LINE2_FONT_SIZE = 6.5; // in vw units
export const DISCOUNT_PERCENT_FONT_SIZE = 5.0; // in vw units

export const DURATION_BUTTON_PX = 1.5; // Horizontal padding (vw)
export const DURATION_BUTTON_PY = 0.5; // Vertical padding (vw)
export const DURATION_BUTTON_FONT_SIZE = 0.6; // Font size (vw)
export const DURATION_BUTTON_RADIUS = 0.4; // Border radius (vw)

export const POPULAR_BADGE_PX = 1.3; // Horizontal padding (vw)
export const POPULAR_BADGE_PY = 0.5; // Vertical padding (vw)
export const POPULAR_BADGE_FONT_SIZE = 0.6; // Font size (vw)
export const POPULAR_BADGE_Y_OFFSET = 3.2; // Distance from top (vw)

export const CARD_STANDARD_HEIGHT = 65; // Height in percentage (%)
export const CARD_FEATURED_HEIGHT = 75; // Height in percentage (%)
export const CARD_STANDARD_WIDTH = 15; // Width in vw units
export const CARD_FEATURED_WIDTH = 21; // Width in vw units
export const CARD_STANDARD_FLEX = 1; // Flex grow basis
export const CARD_FEATURED_FLEX = 1.4; // Flex grow basis

export const CARD_RADIUS = .8; // in vw units
export const BANNER_RADIUS = 1.5; // in vw units
