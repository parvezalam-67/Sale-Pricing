/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  COLORS, 
  OLD_PRICE_COLOR, 
  DURATION_LABEL_COLOR, 
  FEATURED_HEADER_TEXT_COLOR, 
  STANDARD_HEADER_TEXT_COLOR, 
  CARD_HEADER_FONT_SIZE,
  DURATION_BUTTON_PX,
  DURATION_BUTTON_PY,
  DURATION_BUTTON_FONT_SIZE,
  DURATION_BUTTON_RADIUS,
  POPULAR_BADGE_PX,
  POPULAR_BADGE_PY,
  POPULAR_BADGE_FONT_SIZE,
  POPULAR_BADGE_Y_OFFSET,
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
  const theme = THEMES[mode || 'forex'];
  const accentColor = theme.accent;
  
  // Custom logic for single card products
  const isOneCardProduct = ['copier', 'guardian', 'raven'].includes(mode || '');
  const displayName = (isOneCardProduct && name.toLowerCase() === 'advance') ? 'LIFETIME' : name;
  const showBadge = isFeatured && !isOneCardProduct;
  const showDuration = duration && !['copier', 'guardian', 'raven'].includes(mode || '');

  const cardGradient = isFeatured ? theme.card.featured : theme.card.standard;
  
  const borderStyle = isFeatured ? { borderColor: accentColor } : { borderColor: 'rgba(255,255,255,0.05)' };
  const shadowStyle = isFeatured ? `shadow-[0_0_40px_${accentColor}25]` : 'shadow-xl';

  const headerTextColor = isFeatured ? FEATURED_HEADER_TEXT_COLOR : STANDARD_HEADER_TEXT_COLOR;

  // Adjust size if it's the only card
  const cardHeight = isFeatured ? CARD_FEATURED_HEIGHT : CARD_STANDARD_HEIGHT;
  const cardWidth = isOneCardProduct ? 18 : (isFeatured ? CARD_FEATURED_WIDTH : CARD_STANDARD_WIDTH);
  const cardFlex = isOneCardProduct ? '0 0 auto' : (isFeatured ? CARD_FEATURED_FLEX : CARD_STANDARD_FLEX);

  const priceScale = isOneCardProduct ? 'scale-[1.25]' : (isFeatured ? 'scale-110' : '');
  const oldPriceScale = isOneCardProduct ? 'scale-[1.1]' : '';

  return (
    <div 
      className={`flex flex-col overflow-hidden relative border-2 transition-all duration-500 ${shadowStyle}`}
      style={{ 
        ...borderStyle,
        background: `linear-gradient(to bottom, ${cardGradient.join(', ')})`,
        height: `${cardHeight}%`,
        flex: cardFlex,
        width: isOneCardProduct ? `${cardWidth}vw` : 'auto',
        maxWidth: isOneCardProduct ? 'none' : `${cardWidth}vw`,
        borderRadius: `${CARD_RADIUS}vw`
      }}
    >
      {/* Header */}
      <div 
        className="py-3 text-center border-b border-white/5 m-1"
        style={{ 
          backgroundColor: isFeatured ? accentColor : 'rgba(255, 255, 255, 0.05)',
          borderRadius: `${CARD_RADIUS * 0.8}vw`
        }}
      >
        <span 
          className="font-black uppercase tracking-widest"
          style={{ 
            color: headerTextColor,
            fontSize: `${CARD_HEADER_FONT_SIZE}vw`
          }}
        >
          {displayName}
        </span>
      </div>
      
      {/* Popular Badge */}
      {showBadge && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 z-20"
          style={{ top: `${POPULAR_BADGE_Y_OFFSET}vw` }}
        >
          <div 
            className="bg-[#ff0000] text-white rounded-full font-black uppercase tracking-tighter shadow-lg text-center whitespace-nowrap"
            style={{
              paddingLeft: `${POPULAR_BADGE_PX}vw`,
              paddingRight: `${POPULAR_BADGE_PX}vw`,
              paddingTop: `${POPULAR_BADGE_PY}vw`,
              paddingBottom: `${POPULAR_BADGE_PY}vw`,
              fontSize: `${POPULAR_BADGE_FONT_SIZE}vw`
            }}
          >
            Most Popular
          </div>
        </div>
      )}

      {/* Body */}
      <div className={`flex-1 flex flex-col items-center justify-center p-6 ${isFeatured ? 'py-8' : 'py-6'} m-1`} style={{ borderRadius: `${CARD_RADIUS * 0.8}vw`, backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <div className="mb-auto" />
        
        {oldPrice && (
          <div className={`mb-0 ${oldPriceScale}`}>
            <PriceDisplay amount={oldPrice} color={OLD_PRICE_COLOR} size="small" isStrikethrough={true} />
          </div>
        )}
        
        <div className={priceScale}>
          <PriceDisplay amount={price} color={accentColor} />
        </div>
        
        {showDuration && (
          <div 
            className={`mt-4 transition-all duration-300 ${isFeatured ? 'shadow-[0_0_15px_rgba(255,255,255,0.1)]' : ''}`}
            style={{
              paddingLeft: `${DURATION_BUTTON_PX}vw`,
              paddingRight: `${DURATION_BUTTON_PX}vw`,
              paddingTop: `${DURATION_BUTTON_PY}vw`,
              paddingBottom: `${DURATION_BUTTON_PY}vw`,
              borderRadius: `${DURATION_BUTTON_RADIUS}vw`,
              backgroundColor: isFeatured ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              border: `1.5px solid ${isFeatured ? accentColor : 'rgba(255, 255, 255, 0.1)'}`,
            }}
          >
            <span 
              className="font-black uppercase tracking-[0.25em] block text-center whitespace-nowrap drop-shadow-sm" 
              style={{ 
                color: isFeatured ? '#ffffff' : accentColor,
                fontSize: `${DURATION_BUTTON_FONT_SIZE}vw`
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
