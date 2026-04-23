/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TabType = 'forex' | 'gold' | 'indices' | 'combo' | 'copier' | 'guardian' | 'raven' | 'signals' | 'algo' | string;

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  duration: string;
  isFeatured?: boolean;
}

export interface BannerState {
  flashText: string;
  discountPercent: string;
  bgImage: string | null;
  bgPrompt: string;
  isGenerating: boolean;
}
