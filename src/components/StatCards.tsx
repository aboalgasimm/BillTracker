'use client';

import React from 'react';
import { Package, DollarSign, ShieldCheck, AlertTriangle, ShieldX } from 'lucide-react';
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
      
      {/* 1. Total Items */}
      <div 
        onClick={() => onFilterByStatus('')}
        className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all hover:border-amber-500 shadow-xs ${
          activeStatusFilter === '' ? 'border-amber-800 ring-2 ring-amber-800/10' : 'border-[#EBE5DA]'
        }`}
      >
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">إجمالي المشتريات</span>
          <div className="p-1.5 bg-amber-50 text-amber-800 rounded-xl">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-stone-900">{stats.totalItems}</div>
        <p className="text-[11px] text-stone-500 font-medium mt-1">منتج ومغطي بالضمان</p>
      </div>

      {/* 2. Total Asset Value */}
      <div className="bg-white border border-[#EBE5DA] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">قيمة الأصول والمشتريات</span>
          <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded-xl">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-stone-900">
          {formatCurrency(stats.totalValue)} <span className="text-xs font-bold text-stone-600">ريال</span>
        </div>
        <p className="text-[11px] text-stone-500 font-medium mt-1">القيمة التقديرية المسجلة</p>
      </div>

      {/* 3. Active Warranties */}
      <div 
        onClick={() => onFilterByStatus('active')}
        className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all hover:border-emerald-500 shadow-xs ${
          activeStatusFilter === 'active' ? 'border-emerald-600 ring-2 ring-emerald-600/10' : 'border-[#EBE5DA]'
        }`}
      >
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">ضمانات سارية ومحمية</span>
          <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-xl">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-emerald-700">{stats.activeWarranties}</div>
        <p className="text-[11px] text-emerald-800 font-bold mt-1">تغطية رسمية سارية 🟢</p>
      </div>

      {/* 4. Expiring & Expired Warranties */}
      <div 
        onClick={() => onFilterByStatus('expiring_soon')}
        className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all hover:border-amber-500 shadow-xs ${
          activeStatusFilter === 'expiring_soon' || activeStatusFilter === 'expired'
            ? 'border-amber-600 ring-2 ring-amber-600/20 bg-amber-50/20'
            : 'border-[#EBE5DA]'
        }`}
      >
        <div className="flex items-center justify-between text-stone-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900">تنبيهات الضمان</span>
          <div className="p-1.5 bg-amber-100 text-amber-800 rounded-xl">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <span className="text-2xl font-black text-amber-800">{stats.expiringSoonWarranties}</span>
            <span className="text-[10px] font-bold text-amber-900 mr-1">قريباً</span>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div>
            <span className="text-2xl font-black text-rose-700">{stats.expiredWarranties}</span>
            <span className="text-[10px] font-bold text-rose-800 mr-1">منتهي</span>
          </div>
        </div>
        <p className="text-[11px] text-amber-900 font-bold mt-1">اضغط للتصفية السريعة 🟠</p>
      </div>

    </div>
  );
}
