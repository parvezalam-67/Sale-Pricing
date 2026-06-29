/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CARD_HEADER_FONT_SIZE,
  POPULAR_BADGE_PX,
  POPULAR_BADGE_PY,
  POPULAR_BADGE_FONT_SIZE,
  CARD_STANDARD_HEIGHT,
  CARD_FEATURED_HEIGHT,
  CARD_STANDARD_WIDTH,
  CARD_FEATURED_WIDTH,
  CARD_STANDARD_FLEX,
  CARD_FEATURED_FLEX,
  CARD_RADIUS,
  THEMES
} from '../constants';
import { PricingPlan, TabType } from '../types';
import { PriceDisplay } from './PriceDisplay';

export const PricingCard = ({ plan, mode = 'forex' }: { plan: PricingPlan; key?: string | number; mode?: TabType }) => {
  const { name, price, oldPrice, duration, isFeatured } = plan;
  const theme = THEMES[mode || 'forex'] ?? THEMES['forex'];

  const isOneCardProduct = ['copier', 'guardian', 'raven'].includes(mode || '');
  const displayName = (isOneCardProduct && name.toLowerCase() === 'advance') ? 'LIFETIME' : name;
  const showBadge = isFeatured && !isOneCardProduct;
  const showDuration = duration && !['copier', 'guardian', 'raven'].includes(mode || '');

  const cardHeight = isFeatured ? CARD_FEATURED_HEIGHT : CARD_STANDARD_HEIGHT;
  const cardWidth = isOneCardProduct ? 18 : (isFeatured ? CARD_FEATURED_WIDTH : CARD_STANDARD_WIDTH);
  const cardFlex = isOneCardProduct ? '0 0 auto' : (isFeatured ? CARD_FEATURED_FLEX : CARD_STANDARD_FLEX);

  const priceScale = isOneCardProduct ? 'scale-[1.25]' : (isFeatured ? 'scale-110' : '');
  const oldPriceScale = isOneCardProduct ? 'scale-[1.1]' : '';

  // ── SVG dimensions (matches viewBox="0 0 426 568") ──────────────────────────
  // Outer rect: full card, rx=outerRx
  // Inner gradient rect: inset 7px sides, starts at y=127 → bottom inset=7 → rx = outerRx-7
  // Inner stroke rect:   inset 18.5px sides, starts at y=138.5 → bottom of outer=568, bottom of stroke=550.5 → inset=17.5 → rx ≈ outerRx-18.5
  // This ensures concentric, perfectly matched corner curves.
  const outerRx = CARD_RADIUS * 30; // e.g. 0.8*30 = 24
  const innerGradRx = Math.max(4, outerRx - 7);   // ≈17
  const innerStrokeRx = Math.max(2, outerRx - 18.5); // ≈5.5

  // Theme-driven colours
  const outerFill   = isFeatured ? theme.accent      : theme.outerShell;
  const gradStart   = theme.innerGradStart;
  const strokeColor = theme.innerStroke;
  const priceColor  = theme.priceColor;

  // Header text: white by default; #000 only when featured AND theme.headerTextDark
  const headerTextColor = (isFeatured && theme.headerTextDark) ? '#000000' : '#ffffff';

  return (
    <div
      className="flex flex-col relative transition-all duration-500"
      style={{
        height: `${cardHeight}%`,
        flex: cardFlex,
        width: isOneCardProduct ? `${cardWidth}vw` : 'auto',
        maxWidth: isOneCardProduct ? 'none' : `${cardWidth}vw`,
        backgroundColor: outerFill,
        borderRadius: `${CARD_RADIUS}vw`,
      }}
    >
      {/* ── CSS card background layers ── */}
      {/* Inner radial gradient area — inset 1.64% left/right, 22.36% top, 1.23% bottom */}
      <div
        style={{
          position: 'absolute',
          left: '1.64%',
          right: '1.64%',
          top: '22.36%',
          bottom: '1.23%',
          borderRadius: `max(4px, calc(${CARD_RADIUS}vw - 0.16vw))`,
          background: `radial-gradient(circle at 50% 0%, ${gradStart} 0%, #000000 100%)`,
          zIndex: 1,
        }}
      />
      {/* Inner stroke border — inset 4.34% left/right, 24.38% top, 3.08% bottom */}
      <div
        style={{
          position: 'absolute',
          left: '4.34%',
          right: '4.34%',
          top: '24.38%',
          bottom: '3.08%',
          borderRadius: `max(2px, calc(${CARD_RADIUS}vw - 0.43vw))`,
          border: `1.5px solid ${strokeColor}`,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* ── Header ── */}
      <div className="relative z-10 text-center pt-[6%] pb-[3%]">
        <span
          className="font-black uppercase tracking-widest"
          style={{
            color: headerTextColor,
            fontSize: `${CARD_HEADER_FONT_SIZE}vw`,
          }}
        >
          {displayName}
        </span>
      </div>

      {/* ── Most Popular Badge (inside card, below header) ── */}
      {showBadge && (
        <div className="relative z-20 flex justify-center pb-[3%]">
          <div
            className="bg-[#cc0000] text-white rounded-full font-black uppercase tracking-tight shadow-lg text-center whitespace-nowrap"
            style={{
              paddingLeft: `${POPULAR_BADGE_PX}vw`,
              paddingRight: `${POPULAR_BADGE_PX}vw`,
              paddingTop: `${POPULAR_BADGE_PY}vw`,
              paddingBottom: `${POPULAR_BADGE_PY}vw`,
              fontSize: `${POPULAR_BADGE_FONT_SIZE}vw`,
            }}
          >
            Most Popular
          </div>
        </div>
      )}

      {/* ── Body (prices + duration) ── */}
      <div
        className={`flex-1 flex flex-col items-center justify-center relative z-10 ${isFeatured ? 'pb-[6%]' : 'pb-[4%]'}`}
      >
        <div className="mb-auto" />

        {oldPrice && (
          <div className={`mb-0 ${oldPriceScale}`}>
            {/* Old price: always #888888 with red (#cc1515) diagonal strikethrough */}
            <PriceDisplay amount={oldPrice} color="#888888" size="small" isStrikethrough={true} />
          </div>
        )}

        <div className={priceScale}>
          {/* New/sale price: theme.priceColor */}
          <PriceDisplay amount={price} color={priceColor} />
        </div>

        {showDuration && (
          <div className="mt-[4%]">
            {/* Duration: always #8abda0 — constant across all themes */}
            <span
              className="font-black uppercase tracking-[0.15em] block text-center whitespace-nowrap"
              style={{
                color: '#8abda0',
                fontSize: `${0.65}vw`,
              }}
            >
              {duration}
            </span>
          </div>
        )}

        <div className="mt-auto mb-2" />
      </div>
    </div>
  );
};
