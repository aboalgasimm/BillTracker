'use client';

import React from 'react';
import { Package, CreditCard, Droplets, Home, Wrench } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'items' | 'bills' | 'water' | 'rent' | 'maintenance';
  setActiveTab: (tab: 'items' | 'bills' | 'water' | 'rent' | 'maintenance') => void;
  unpaidBillsCount: number;
  expiringWarrantiesCount: number;
}

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  unpaidBillsCount,
  expiringWarrantiesCount
}: MobileBottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EBE5DA] px-2 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        
        {/* Tab 1: Purchases */}
        <button
          onClick={() => setActiveTab('items')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'items'
              ? 'text-amber-800 bg-amber-50 font-bold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <div className="relative">
            <Package className="w-5 h-5" />
            {expiringWarrantiesCount > 0 && (
              <span className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-amber-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {expiringWarrantiesCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">المشتريات</span>
        </button>

        {/* Tab 2: Monthly Bills */}
        <button
          onClick={() => setActiveTab('bills')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'bills'
              ? 'text-amber-800 bg-amber-50 font-bold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <div className="relative">
            <CreditCard className="w-5 h-5" />
            {unpaidBillsCount > 0 && (
              <span className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {unpaidBillsCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">الفواتير</span>
        </button>

        {/* Tab 3: Maintenance */}
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'maintenance'
              ? 'text-amber-800 bg-amber-50 font-bold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[10px]">الصيانة</span>
        </button>

        {/* Tab 4: Water Rotation */}
        <button
          onClick={() => setActiveTab('water')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'water'
              ? 'text-blue-800 bg-blue-50 font-bold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <Droplets className="w-5 h-5 text-blue-600" />
          <span className="text-[10px]">ماء العمارة</span>
        </button>

        {/* Tab 5: Rent */}
        <button
          onClick={() => setActiveTab('rent')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'rent'
              ? 'text-amber-800 bg-amber-50 font-bold'
              : 'text-stone-500 hover:text-stone-800 font-medium'
          }`}
        >
          <Home className="w-5 h-5 text-amber-800" />
          <span className="text-[10px]">الإيجار</span>
        </button>

      </div>
    </nav>
  );
}
