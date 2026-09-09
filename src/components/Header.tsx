/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Pill,
  Search,
  ShoppingCart,
  MapPin,
  FileText,
  Calculator,
  Truck,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'catalog' | 'prescription' | 'calculator' | 'orders';
  onTabChange: (tab: 'catalog' | 'prescription' | 'calculator' | 'orders') => void;
  cartCount: number;
  cartTotalSaved: number;
  onOpenCart: () => void;
  onOpenPharmacistHelp: () => void;
  deliveryPincode: string;
  onChangePincode: (pincode: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  cartCount,
  cartTotalSaved,
  onOpenCart,
  onOpenPharmacistHelp,
  deliveryPincode,
  onChangePincode,
  searchQuery,
  onSearchChange,
}) => {
  const [isEditingPincode, setIsEditingPincode] = useState(false);
  const [tempPincode, setTempPincode] = useState(deliveryPincode);

  const handleSavePincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempPincode.trim()) {
      onChangePincode(tempPincode.trim());
      setIsEditingPincode(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200/80 shadow-xs">
      {/* Top micro-announcement banner */}
      <div className="bg-emerald-700 text-white text-xs font-medium py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-emerald-800/80 px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-100">
              <ShieldCheck className="w-3 h-3" /> WHO-GMP & FDA Certified
            </span>
            <span className="hidden sm:inline">
              100% Bioequivalent Generic Medicines with identical active salts. Save up to 85%!
            </span>
            <span className="sm:hidden">Save up to 85% with identical generic salts</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-emerald-100">
            <button
              onClick={onOpenPharmacistHelp}
              className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3 h-3" /> Free Pharmacist Consult (24/7)
            </button>
            <span className="hidden md:inline text-emerald-300">|</span>
            <span className="hidden md:flex items-center gap-1 text-emerald-200">
              <Truck className="w-3 h-3" /> Express Doorstep Delivery in 45 Mins
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('catalog')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-700 transition-colors">
                <Pill className="w-5 h-5 -rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-zinc-900 tracking-tight">
                    Generic<span className="text-emerald-600">Med</span>
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Rx Delivery
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 hidden sm:block">
                  Exact Active Salts • Verified Affordable Generics
                </p>
              </div>
            </button>
          </div>

          {/* Quick Search Bar */}
          <div className="flex-1 max-w-xl mx-2">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="search-medicine-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (activeTab !== 'catalog') {
                    onTabChange('catalog');
                  }
                }}
                placeholder="Search branded medicine (e.g. Lipitor, Augmentin, Crocin) or active salt..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Pincode / Delivery location selector */}
            <div className="relative hidden lg:block">
              {isEditingPincode ? (
                <form onSubmit={handleSavePincode} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempPincode}
                    onChange={(e) => setTempPincode(e.target.value)}
                    className="w-24 px-2 py-1 text-xs border border-emerald-500 rounded bg-white"
                    placeholder="Enter zip"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white text-xs px-2 py-1 rounded font-medium hover:bg-emerald-700"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsEditingPincode(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100 text-xs text-zinc-700 transition-colors cursor-pointer"
                  title="Click to update delivery zip code"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Deliver to: <strong>{deliveryPincode}</strong></span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>
              )}
            </div>

            {/* Cart Button with Savings Badge */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-xs cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold leading-tight">
                  Cart ({cartCount})
                </div>
                {cartTotalSaved > 0 && (
                  <div className="text-[10px] text-emerald-300 font-medium leading-none">
                    Save ${cartTotalSaved.toFixed(2)}
                  </div>
                )}
              </div>
              {cartCount > 0 && (
                <span className="sm:hidden absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Secondary Tab Bar */}
        <div className="flex items-center gap-1 sm:gap-2 mt-2 pt-2 border-t border-zinc-100 overflow-x-auto no-scrollbar text-xs font-medium">
          <button
            onClick={() => onTabChange('catalog')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Pill className="w-3.5 h-3.5 text-emerald-600" />
            Find Generic Substitutes
          </button>

          <button
            onClick={() => onTabChange('prescription')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'prescription'
                ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            Upload Rx (Auto-Generic Finder)
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1 rounded font-bold">
              AI Scan
            </span>
          </button>

          <button
            onClick={() => onTabChange('calculator')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            Monthly Savings Calculator
          </button>

          <button
            onClick={() => onTabChange('orders')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            Orders & Live Tracking
          </button>

          <div className="ml-auto hidden md:flex items-center gap-2 text-zinc-500 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Over <strong>$1.2M</strong> patient savings delivered to date</span>
          </div>
        </div>
      </div>
    </header>
  );
};
