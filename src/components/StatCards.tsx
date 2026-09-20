'use client';

import React from 'react';
import { Package, ShieldCheck, AlertTriangle, DollarSign } from 'lucide-react';
import { StatsOverview } from '@/types';

interface StatCardsProps {
  stats: StatsOverview;
  activeStatusFilter: string;
  onFilterByStatus: (status: string) => void;
}

export default function StatCards({ stats, activeStatusFilter, onFilterByStatus }: StatCardsProps) {
  const formatCurrency = (amount: number) => {
    return (amount || 0).toLocaleString('en-US');
  };

  return (
    <div className="bg-white border border-[#EBE5DA] rounded-2xl p-3 sm:p-4 mb-6 shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-stone-100">
        
        {/* 1. Total Items */}
        <div 
          onClick={() => onFilterByStatus('')}
          className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
            activeStatusFilter === '' ? 'bg-amber-50/80 border border-amber-200' : 'hover:bg-stone-50'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-100">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 font-semibold block">إجمالي المشتريات</span>
            <div className="text-base font-black text-stone-900">
              {stats.totalItems} <span className="text-[11px] font-bold text-stone-500">منتج</span>
            </div>
          </div>
        </div>

        {/* 2. Total Asset Value */}
        <div className="flex items-center gap-3 p-2.5 pt-3 lg:pt-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 font-semibold block">قيمة الأصول المسجلة</span>
            <div className="text-base font-black text-stone-900">
              {formatCurrency(stats.totalValue)} <span className="text-[11px] font-bold text-stone-500">ر.س</span>
            </div>
          </div>
        </div>

        {/* 3. Active Warranties */}
        <div 
          onClick={() => onFilterByStatus('active')}
          className={`flex items-center gap-3 p-2.5 pt-3 lg:pt-2.5 cursor-pointer transition-all ${
            activeStatusFilter === 'active' ? 'bg-emerald-50/80 border border-emerald-200' : 'hover:bg-stone-50'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 font-semibold block">ضمانات سارية</span>
            <div className="text-base font-black text-emerald-700">
              {stats.activeWarranties} <span className="text-[11px] font-bold text-emerald-600">ساري 🟢</span>
            </div>
          </div>
        </div>

        {/* 4. Expiring Warranties */}
        <div 
          onClick={() => onFilterByStatus('expiring_soon')}
          className={`flex items-center gap-3 p-2.5 pt-3 lg:pt-2.5 cursor-pointer transition-all ${
            activeStatusFilter === 'expiring_soon' ? 'bg-amber-50/80 border border-amber-200' : 'hover:bg-stone-50'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 font-semibold block">تنبيهات الانتهاء</span>
            <div className="text-base font-black text-amber-900">
              {stats.expiringSoonWarranties} <span className="text-[11px] font-bold text-stone-500">قريباً</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
