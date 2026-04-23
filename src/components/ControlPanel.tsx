/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface ControlPanelProps {
  props: {
    flashText: string;
    discountPercent: string;
    bgPrompt: string;
    isGenerating: boolean;
  };
  actions: {
    setFlashText: (v: string) => void;
    setDiscountPercent: (v: string) => void;
    setBgPrompt: (v: string) => void;
    generateBackground: () => void;
  };
}

import React from "react";
import { Download, Upload, RefreshCw } from "lucide-react";
import { SalePricing } from "../services/sheetService";

export const ControlPanel = ({ props, actions }: {
  props: {
    flashText: string;
    discountPercent: string;
    bgPrompt: string;
    isGenerating: boolean;
    isSyncing: boolean;
    availableSales: SalePricing[];
    currentSale: string;
  };
  actions: {
    setFlashText: (v: string) => void;
    setDiscountPercent: (v: string) => void;
    setBgPrompt: (v: string) => void;
    generateBackground: () => void;
    setCurrentSale: (v: string) => void;
    handleDownload: () => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRefresh: () => void;
  };
}) => {
  return (
    <div className="bg-[#0a0a0a] border-t border-white/10 px-8 py-5 flex items-center justify-center space-x-6 shrink-0 overflow-x-auto">
      {/* Sale Config */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Active Sale</label>
            {props.isSyncing && (
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-[#00e676] rounded-full animate-pulse shadow-[0_0_8px_#00e676]" />
                <span className="text-[8px] font-black text-[#00e676] uppercase tracking-tighter">Syncing...</span>
              </div>
            )}
          </div>
        </div>
        <select 
          value={props.currentSale}
          onChange={(e) => actions.setCurrentSale(e.target.value)}
          className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#00e676] min-w-[140px] font-bold text-white uppercase"
        >
          {props.availableSales.map(sale => (
            <option key={sale.saleName} value={sale.saleName}>
              {sale.saleName}
            </option>
          ))}
        </select>
      </div>

      {/* Text Config */}
      <div className="flex items-center space-x-3">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Text</label>
        <input 
          type="text" 
          value={props.flashText}
          onChange={(e) => actions.setFlashText(e.target.value)}
          className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#00e676] w-32 font-bold"
        />
      </div>

      {/* Discount Config */}
      <div className="flex items-center space-x-3">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">% OFF</label>
        <div className="flex items-center bg-zinc-900 border border-white/10 rounded-lg pr-2">
          <input 
            type="number" 
            value={props.discountPercent}
            onChange={(e) => actions.setDiscountPercent(e.target.value)}
            className="bg-transparent px-3 py-1.5 text-xs focus:outline-none w-14 text-center font-bold"
          />
          <span className="text-gray-500 font-black text-[10px]">%</span>
        </div>
      </div>

      {/* AI Config */}
      <div className="flex items-center space-x-3 border-l border-white/10 pl-8">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Background Prompt</label>
        <input 
          type="text" 
          value={props.bgPrompt}
          onChange={(e) => actions.setBgPrompt(e.target.value)}
          className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#00e676] w-64"
          placeholder="AI Background Prompt..."
        />
        <button 
          onClick={actions.generateBackground}
          disabled={props.isGenerating}
          className={`px-4 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all ${
            props.isGenerating 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-[#00e676] text-black hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,230,118,0.3)]'
          }`}
        >
          {props.isGenerating ? 'Generating...' : 'Generate AI Image'}
        </button>
      </div>

      {/* Persistence Controls */}
      <div className="flex items-center space-x-4 border-l border-white/10 pl-8">
        <button 
          onClick={actions.handleRefresh}
          className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] uppercase font-black tracking-widest text-[#00e676]"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>

        <div className="relative group">
          <input 
            type="file" 
            accept="image/*" 
            onChange={actions.handleImageUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
          <button className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] uppercase font-black tracking-widest">
            <Upload size={14} className="text-[#00e676]" />
            <span>Upload Background</span>
          </button>
        </div>

        <button 
          onClick={actions.handleDownload}
          className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-[#00e676] text-black hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,230,118,0.3)] text-[10px] uppercase font-black tracking-widest transition-all"
        >
          <Download size={14} />
          <span>Download PNG</span>
        </button>
      </div>
    </div>
  );
};
