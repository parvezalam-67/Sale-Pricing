/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BannerCanvas } from './components/BannerCanvas';
import { ControlPanel } from './components/ControlPanel';
import { generateBannerBackground } from './services/ai';
import { fetchAllSales, AllSalesData } from './services/sheetService';
import { PLANS as STATIC_PLANS, THEMES } from './constants';

type TabType = string;

// Keep-alive only — NO auto-poll
const KEEPALIVE_INTERVAL = 60000;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('forex');
  const [discountPercent, setDiscountPercent] = useState('66');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [bgPrompt, setBgPrompt] = useState('Abstract forex trading chart with glowing neon green lines on deep black background, cinematic lighting');

  const [salesData, setSalesData] = useState<AllSalesData | null>(null);
  const [currentSale, setCurrentSale] = useState('');
  const [plans, setPlans] = useState(STATIC_PLANS);
  const [saleNameImage, setSaleNameImage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [liveStatus, setLiveStatus] = useState<'connecting' | 'live' | 'error'>('connecting');

  const prevDataHashRef = useRef<string>('');
  const activeTabRef = useRef<TabType>(activeTab);
  const currentSaleRef = useRef<string>(currentSale);
  const userHasSelected = useRef(false);

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { currentSaleRef.current = currentSale; }, [currentSale]);

  const applyData = useCallback((data: AllSalesData, isInitial = false) => {
    setSalesData(data);
    setLastUpdated(new Date());
    setLiveStatus('live');

    if (isInitial) {
      const keys = Object.keys(data);
      const initialTab = keys.includes('signals') ? 'signals' : (keys.includes('forex') ? 'forex' : keys[0]);
      if (initialTab) {
        setActiveTab(initialTab);
        activeTabRef.current = initialTab;
        const currentList = data[initialTab] || [];
        if (currentList.length > 0) {
          const latestSale = currentList[currentList.length - 1];
          setCurrentSale(latestSale.saleName);
          currentSaleRef.current = latestSale.saleName;
          setPlans(latestSale.plans);
          if (latestSale.discountPercent) setDiscountPercent(latestSale.discountPercent);
        }
      }
    } else {
      const tab = activeTabRef.current;
      const currentList = data[tab] || [];
      if (currentList.length > 0) {
        const sale = currentList.find(s => s.saleName === currentSaleRef.current) || currentList[currentList.length - 1];
        setCurrentSale(sale.saleName);
        currentSaleRef.current = sale.saleName;
        setPlans(sale.plans);
        if (sale.discountPercent) setDiscountPercent(sale.discountPercent);
      }
    }
  }, []);

  const loadData = useCallback(async (isInitial = false, force = false) => {
    try {
      if (!isInitial) setIsSyncing(true);
      setError(null);
      const data = await fetchAllSales(force);
      if (Object.keys(data).length === 0) throw new Error('No sales data received from backend');

      const newHash = JSON.stringify(data);
      if (!isInitial && !force && newHash === prevDataHashRef.current) return;
      prevDataHashRef.current = newHash;

      if (!isInitial && userHasSelected.current) {
        setSalesData(data);
        setLastUpdated(new Date());
        setLiveStatus('live');
        const tab = activeTabRef.current;
        const currentList = data[tab] || [];
        const stillExists = currentList.find(s => s.saleName === currentSaleRef.current);
        if (stillExists) {
          setPlans(stillExists.plans);
          if (stillExists.discountPercent) setDiscountPercent(stillExists.discountPercent);
          return;
        }
        userHasSelected.current = false;
      }

      applyData(data, isInitial);
    } catch (err: any) {
      console.error('Data sync failed', err);
      setLiveStatus('error');
      if (isInitial) setError(err.message || 'Failed to connect to spreadsheet data');
    } finally {
      if (isInitial) {
        setIsLoading(false);
      } else {
        setTimeout(() => setIsSyncing(false), 1500);
      }
    }
  }, [applyData]);

  // Initial load only — NO interval poll
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Keep-alive ping only (no UI refresh)
  useEffect(() => {
    const keepAlive = async () => {
      try {
        await fetch(`/api/proxy-sheet?gid=0&ping=1&t=${Date.now()}`);
      } catch { /* silent */ }
    };
    const aliveTimer = setInterval(keepAlive, KEEPALIVE_INTERVAL);
    return () => clearInterval(aliveTimer);
  }, []);

  useEffect(() => {
    if (!salesData || !activeTab) return;
    const currentList = salesData[activeTab] || [];
    if (currentList.length === 0) return;
    const sale = userHasSelected.current
      ? (currentList.find(s => s.saleName === currentSaleRef.current) || currentList[currentList.length - 1])
      : currentList[currentList.length - 1];
    setCurrentSale(sale.saleName);
    currentSaleRef.current = sale.saleName;
    setPlans(sale.plans);
    if (sale.discountPercent) setDiscountPercent(sale.discountPercent);
  }, [activeTab]);

  const handleSaleChange = (saleName: string) => {
    if (!salesData || !activeTab) return;
    const currentList = salesData[activeTab] || [];
    const sale = currentList.find(s => s.saleName === saleName);
    if (sale) {
      userHasSelected.current = true;
      setCurrentSale(saleName);
      currentSaleRef.current = saleName;
      setPlans(sale.plans);
      if (sale.discountPercent) setDiscountPercent(sale.discountPercent);
    }
  };

  const handleGenerateBackground = async () => {
    setIsGenerating(true);
    const result = await generateBannerBackground(bgPrompt);
    if (result) setBgImage(result);
    setIsGenerating(false);
  };

  const bannerRef = useRef<HTMLDivElement>(null);
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);

  const handleSaleNameImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setSaleNameImage(e.target?.result as string);
      reader.readAsDataURL(file);
      // reset so same file can be re-selected
      event.target.value = '';
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setCustomBgImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!bannerRef.current) return;
    try {
      const { toPng } = await import('html-to-image');
      const targetWidth = 2560;
      const targetHeight = 1440;
      const dataUrl = await toPng(bannerRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        canvasWidth: targetWidth,
        canvasHeight: targetHeight,
        style: {
          width: `${targetWidth}px`,
          height: `${targetHeight}px`,
          transform: 'none',
          borderRadius: '0'
        }
      });
      const link = document.createElement('a');
      link.download = `${activeTab}-subscription-banner.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const currentAvailableSales = (salesData && activeTab && salesData[activeTab]) ? salesData[activeTab] : [];

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#030e06] flex flex-col items-center justify-center space-y-6">
        <div className={`w-16 h-16 border-4 border-[#00e676]/20 border-t-[#00e676] rounded-full animate-spin shadow-[0_0_20px_rgba(0,230,118,0.2)] ${error ? 'border-red-500/20 border-t-red-500 animate-none' : ''}`} />
        <div className="flex flex-col items-center">
          <h2 className={`text-[#00e676] font-black uppercase tracking-[0.3em] text-xl ${error ? 'text-red-500' : 'animate-pulse'}`}>
            {error ? 'CONNECTION ERROR' : 'SURESHOT FX'}
          </h2>
          <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mt-2 px-8 text-center max-w-md">
            {error ? error : 'Connecting to Live Data...'}
          </p>
          {error && (
            <button
              onClick={() => { setError(null); setIsLoading(true); loadData(true); }}
              className="mt-6 px-8 py-2 bg-red-500/10 border border-red-500 text-red-500 text-[10px] uppercase font-black tracking-widest hover:bg-red-500 hover:text-white transition-all rounded-full"
            >
              Retry Connection
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black font-sans text-white overflow-hidden selection:bg-[#00e676] selection:text-black">

      {/* Status Bar — updated to show manual refresh only */}
      <div className="flex items-center justify-between px-6 py-1.5 bg-[#020a04] border-b border-white/5">
        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">SureshotFX Banner Studio</span>
        <div className="flex items-center space-x-2">
          {liveStatus === 'live' && (
            <>
              <div className="w-1.5 h-1.5 bg-[#00e676] rounded-full shadow-[0_0_6px_#00e676]" />
              <span className="text-[9px] font-black text-[#00e676] uppercase tracking-widest">
                Ready · Manual Refresh
                {lastUpdated && ` · Last synced ${lastUpdated.toLocaleTimeString()}`}
              </span>
            </>
          )}
          {liveStatus === 'connecting' && (
            <>
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">Connecting...</span>
            </>
          )}
          {liveStatus === 'error' && (
            <>
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Sync Error · Click Refresh</span>
            </>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center py-4 bg-[#030e06] border-b border-white/5 space-x-2 overflow-x-auto px-4">
        {salesData && Object.keys(salesData).length > 0 && Object.keys(salesData).map(key => {
          const theme = THEMES[key] || THEMES['forex'];
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-8 py-2 rounded-full font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${isActive ? 'text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
              style={isActive ? {
                backgroundColor: theme.accent,
                boxShadow: `0 0 20px ${theme.accent}4D`
              } : {}}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Banner Canvas */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <BannerCanvas
          ref={bannerRef}
          mode={activeTab as any}
          discountPercent={discountPercent}
          bgImage={customBgImage || bgImage}
          plans={plans}
          saleNameImage={saleNameImage}
          onUploadSaleNameImage={handleSaleNameImageUpload}
          sectionTitle={
            activeTab ? `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Subscription Plan` : ""
          }
        />
      </div>

      {/* Control Panel */}
      <ControlPanel
        props={{
          discountPercent,
          bgPrompt,
          isGenerating,
          isSyncing,
          availableSales: currentAvailableSales,
          currentSale,
          saleNameImage
        }}
        actions={{
          setDiscountPercent,
          setBgPrompt,
          generateBackground: handleGenerateBackground,
          setCurrentSale: handleSaleChange,
          handleDownload: handleDownload,
          handleImageUpload: handleImageUpload,
          handleSaleNameImageUpload: handleSaleNameImageUpload,
          clearSaleNameImage: () => setSaleNameImage(null),
          handleRefresh: () => { userHasSelected.current = false; loadData(false, true); }
        }}
      />

      <style>{`
        .bg-grid {
          background-size: 5vw 5vw;
          background-image:
            linear-gradient(to right, rgba(0, 230, 118, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 230, 118, 0.08) 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}
