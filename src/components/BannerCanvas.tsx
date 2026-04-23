/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { forwardRef } from 'react';
import { COLORS, DISCOUNT_LABEL_SIZE, LOGO_X_OFFSET, LOGO_Y_OFFSET, UP_TO_OFF_COLOR, TITLE_Y_OFFSET, TITLE_MAX_WIDTH, BANNER_LINE1_FONT_SIZE, BANNER_LINE2_FONT_SIZE, DISCOUNT_PERCENT_FONT_SIZE, THEMES, BANNER_RADIUS } from '../constants';
import { PricingCard } from './PricingCard';
import { Logo } from './Logo';
import { PricingPlan, TabType } from '../types';

export const BannerCanvas = forwardRef<HTMLDivElement, {
  flashText: string;
  discountPercent: string;
  bgImage: string | null;
  plans: PricingPlan[];
  sectionTitle: string;
  mode?: TabType;
}>(({ flashText, discountPercent, bgImage, plans, sectionTitle, mode = 'forex' }, ref) => {
  const theme = THEMES[mode || 'forex'];
  const accentColor = theme.accent;

  // Split text logic
  const words = flashText.trim().split(/\s+/);
  let line1 = '';
  let line2 = '';

  if (words.length >= 2) {
    line1 = words.slice(0, -1).join(' ').toUpperCase();
    line2 = words[words.length - 1].toUpperCase();
  } else {
    line2 = flashText.toUpperCase();
  }

  const labelStyle = { 
    fontSize: `${DISCOUNT_LABEL_SIZE}vw`, 
    lineHeight: '1.2',
    color: UP_TO_OFF_COLOR
  };

  const logoStyle = {
    transform: `translate(${LOGO_X_OFFSET}vw, ${LOGO_Y_OFFSET}vw)`
  };

  const titleStyle = {
    transform: `translateY(${TITLE_Y_OFFSET}vw)`
  };

  const line1Style = {
    fontSize: line1.length > 6 ? `${BANNER_LINE1_FONT_SIZE * Math.min(1, 6.5 / line1.length)}vw` : `${BANNER_LINE1_FONT_SIZE}vw`
  };

  const line2Style = {
    fontSize: line2.length > 4 ? `${BANNER_LINE2_FONT_SIZE * Math.min(1, 4.5 / line2.length)}vw` : `${BANNER_LINE2_FONT_SIZE}vw`,
    color: COLORS.red,
    textShadow: '4px 4px 0px rgba(0,0,0,0.5)'
  };

  // Filter plans based on mode
  let filteredPlans = plans;
  if (mode === 'algo') {
    filteredPlans = plans.filter(p => p.id === 'rise' || p.id === 'advance');
  } else if (['copier', 'guardian', 'raven'].includes(mode || '')) {
    filteredPlans = plans.filter(p => p.id === 'advance');
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-[#000]">
      <div 
        ref={ref}
        className="aspect-video w-full max-w-[1280px] relative overflow-hidden flex ring-1 ring-white/10"
        style={{ 
          background: `linear-gradient(135deg, ${theme.bg.join(', ')})`,
          borderRadius: `${BANNER_RADIUS}vw`
        }}
      >
        {/* Background Layer */}
        {bgImage ? (
          <img 
            src={bgImage} 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-50 z-0"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-0" />

        {/* Column 1: Sales Info */}
        <div className="w-[38%] flex flex-col p-[4%] z-10 justify-between">
          {/* Logo Component */}
          <div style={logoStyle}>
            <Logo className="h-[2vw] w-auto" />
          </div>

          <div className="flex flex-col flex-1 justify-center">
            <div 
              className="flex flex-col space-y-[-1vw]"
              style={{ 
                ...titleStyle, 
                maxWidth: `${TITLE_MAX_WIDTH}%` 
              }}
            >
              {line1 && (
                <h1 
                  className="font-black uppercase leading-none tracking-tight text-white mb-2 whitespace-nowrap"
                  style={line1Style}
                >
                  {line1}
                </h1>
              )}
              <h1 
                className="font-black uppercase leading-[0.8] tracking-tighter whitespace-nowrap"
                style={line2Style}
              >
                {line2}
              </h1>
            </div>
          </div>

          <div className="flex items-end space-x-2">
            <div className="flex flex-col mb-[1.2vw] font-black uppercase">
              <span style={labelStyle}>Up</span>
              <span style={labelStyle}>To</span>
              <span style={labelStyle}>Off</span>
            </div>
            <span 
              className="font-black leading-none"
              style={{ 
                color: COLORS.red, 
                textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
                fontSize: `${DISCOUNT_PERCENT_FONT_SIZE}vw`
              }}
            >
              {discountPercent}%
            </span>
          </div>
        </div>

        {/* Column 2: Subscription Plans */}
        <div className="w-[62%] flex flex-col p-[4%] z-10">
          <div className="flex w-full justify-center mb-[2%]" style={titleStyle}>
            <div className="flex flex-col items-center">
              <h2 
                className="font-orbitron font-bold uppercase tracking-[0.1xm] leading-tight" 
                style={{ 
                  color: accentColor,
                  fontSize: '3.5vw',
                  textShadow: '0 0 20px rgba(0,0,0,0.5)'
                }}
              >
                {sectionTitle.includes('Subscription') 
                  ? sectionTitle.split('Subscription')[0].trim() 
                  : sectionTitle.split(' ')[0]}
              </h2>
              <h3 
                className="font-orbitron font-medium uppercase tracking-[.1em] leading-none mt-[-0.1vw]" 
                style={{ 
                  color: '#ffffff',
                  fontSize: '1.5vw',
                  opacity: 0.9
                }}
              >
                {sectionTitle.includes('Subscription')
                  ? `Subscription ${sectionTitle.split('Subscription')[1].trim()}`.trim()
                  : sectionTitle.split(' ').slice(1).join(' ')}
              </h3>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center space-x-[3%] pb-[2%]">
            {filteredPlans.map(plan => (
              <PricingCard key={plan.id} plan={plan} mode={mode} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
