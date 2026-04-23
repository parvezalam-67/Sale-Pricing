/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { COLORS, STRIKE_THROUGH_COLOR, OLD_PRICE_FONT_SIZE, NEW_PRICE_FONT_SIZE } from '../constants';

interface PriceDisplayProps {
  amount: string;
  color?: string;
  isStrikethrough?: boolean;
  strikeColor?: string;
  size?: 'small' | 'large';
}

export const PriceDisplay = ({ 
  amount, 
  color = COLORS.brightGreen, 
  isStrikethrough = false, 
  strikeColor = STRIKE_THROUGH_COLOR,
  size = 'large'
}: {
  amount: string;
  color?: string;
  isStrikethrough?: boolean;
  strikeColor?: string;
  size?: 'small' | 'large';
}) => {
  const parts = amount.split('.');
  const dollars = parts[0];
  const cents = parts[1] || '00';

  const isOldPrice = isStrikethrough;

  return (
    <div className={`relative inline-flex items-start font-black ${isOldPrice ? 'scale-100 opacity-70 mb-0' : ''}`}>
      <span className={`${isOldPrice ? 'text-[0.6em] mt-1' : 'text-[0.5em] mt-[0.2em]'} font-bold leading-none`} style={{ color }}>$</span>
      <span 
        className="leading-none tracking-tighter" 
        style={{ 
          color,
          fontSize: isOldPrice ? `${OLD_PRICE_FONT_SIZE}vw` : `${NEW_PRICE_FONT_SIZE}vw`
        }}
      >
        {dollars}
      </span>
      <span 
        className={`${isOldPrice ? 'text-[1vw] mt-1' : 'text-[0.9vw] mt-[0.3vw]'} font-bold leading-none`} 
        style={{ 
          color,
          fontSize: isOldPrice ? `${OLD_PRICE_FONT_SIZE * 0.25}vw` : `${NEW_PRICE_FONT_SIZE * 0.25}vw`
        }}
      >
        .{cents}
      </span>
      {isStrikethrough && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden h-full w-full">
          <div 
            className="w-[120%] h-[3px] rotate-[-25deg] origin-center translate-x-[-10%]" 
            style={{ backgroundColor: strikeColor }} 
          />
        </div>
      )}
    </div>
  );
};
