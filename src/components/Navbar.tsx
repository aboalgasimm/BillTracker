'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, Users, Search, Home, CreditCard, Droplets, Package, Wrench, Share2, ChevronDown } from 'lucide-react';
import { FamilyMember, Bill, WaterRotation, RentPayment } from '@/types';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedFamilyMember: string;
  setSelectedFamilyMember: (name: string) => void;
  familyMembers: FamilyMember[];
  activeTab: 'items' | 'bills' | 'water' | 'rent' | 'maintenance';
  setActiveTab: (tab: 'items' | 'bills' | 'water' | 'rent' | 'maintenance') => void;
  onOpenAddModal: () => void;
  onOpenFamilyModal: () => void;
  onExport: (format: 'csv' | 'json') => void;
  bills?: Bill[];
  waterRotation?: WaterRotation | null;
  rentPayments?: RentPayment[];
}

export default function Navbar({
  searchQuery,
  setSearchQuery,
  selectedFamilyMember,
  setSelectedFamilyMember,
  familyMembers,
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenFamilyModal,
  onExport,
  bills = [],
  waterRotation = null,
  rentPayments = []
}: NavbarProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shareWhatsAppMonthlySummary = () => {
    const safeBills = bills || [];
    const safeRent = rentPayments || [];

    const unpaidBills = safeBills.filter((b) => b.status !== 'paid');
    const unpaidBillsCount = unpaidBills.length;
    const unpaidBillsTotal = unpaidBills.reduce((sum, b) => sum + (b.amount || 0), 0);

    const waterTurnText = waterRotation?.is_our_turn
      ? `🟢 الدور على شقتنا في ماء العمارة (الدفعة ${waterRotation.current_turn_count} من أصل ${waterRotation.total_turns_per_cycle})`
      : `⏳ ماء العمارة: انتظار دور الشقق الأخرى`;

    const rentJune = safeRent.find((r) => r.due_month === 'june');
    const rentDec = safeRent.find((r) => r.due_month === 'december');
    const rentJuneStatus = rentJune?.status === 'paid' ? 'تم الدفع 🟢' : 'مستحقة (10,000 ريال)';
    const rentDecStatus = rentDec?.status === 'paid' ? 'تم الدفع 🟢' : 'مستحقة (10,000 ريال)';

    const text = encodeURIComponent(
      `🏠 *ملخص بيت العائلة الشامل للمصاريف والالتزامات* 🏠:\n\n` +
      `💳 *الفواتير الشهرية المستحقة*: (${unpaidBillsCount} فواتير بمجموع ${unpaidBillsTotal.toLocaleString('en-US')} ريال)\n` +
      `🏢 *ماء العمارة*: ${waterTurnText}\n` +
      `🏠 *دفعة إيجار يونيو*: ${rentJuneStatus}\n` +
      `🏠 *دفعة إيجار ديسمبر*: ${rentDecStatus}\n\n` +
      `للمعاينة والمتابعة يرجى فتح منصة بيت العائلة!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <header className="bg-white border-b border-[#EBE5DA] sticky top-0 z-30 shadow-xs">
      
      {/* Row 1: Brand, Search & Upper-Left Plus Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3">
          
          {/* Brand Logo (Right side in RTL) */}
          <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => setActiveTab('items')}>
            <div className="w-9 h-9 rounded-xl bg-amber-800 flex items-center justify-center text-white shadow-xs">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight leading-none">بيت العائلة</h1>
              <p className="text-[10px] text-stone-500 font-medium hidden sm:block mt-0.5">سجل المشتريات والالتزامات</p>
            </div>
          </div>

          {/* Search Input (Middle) */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-8 pl-3 py-1.5 bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Desktop Extra Controls */}
          <div className="hidden lg:flex items-center gap-2">
            
            <button
              onClick={shareWhatsAppMonthlySummary}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>ملخص الشهر بواتساب</span>
            </button>

            <select
              value={selectedFamilyMember}
              onChange={(e) => setSelectedFamilyMember(e.target.value)}
              className="bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl text-xs font-semibold text-stone-800 px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="">جميع أفراد العائلة</option>
              {(familyMembers || []).map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>

            <button
              onClick={onOpenFamilyModal}
              className="px-3 py-1.5 bg-[#FDFBF7] hover:bg-stone-100 text-stone-700 rounded-xl border border-[#EBE5DA] transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-amber-800" />
              <span>العائلة</span>
            </button>

            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="px-3 py-1.5 bg-[#FDFBF7] hover:bg-stone-100 text-stone-700 rounded-xl border border-[#EBE5DA] transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>تصدير</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {isExportOpen && (
                <div className="absolute left-0 mt-1.5 w-36 bg-white border border-[#EBE5DA] rounded-xl shadow-xl z-50 overflow-hidden py-1">
                  <button
                    onClick={() => {
                      setIsExportOpen(false);
                      onExport('csv');
                    }}
                    className="w-full text-right px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-amber-50"
                  >
                    ملف CSV (.csv)
                  </button>
                  <button
                    onClick={() => {
                      setIsExportOpen(false);
                      onExport('json');
                    }}
                    className="w-full text-right px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-amber-50 border-t border-stone-100"
                  >
                    نسخة JSON (.json)
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Upper Left Plus (+) Button - Main Action Trigger */}
          <button
            onClick={onOpenAddModal}
            className="bg-amber-800 hover:bg-amber-900 text-white font-bold p-2 sm:px-4 sm:py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm cursor-pointer shrink-0 transition-transform active:scale-95"
            title="إضافة عنصر جديد"
          >
            <Plus className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">إضافة جديد</span>
          </button>

        </div>
      </div>

      {/* Row 2: Desktop Tabs ONLY (Hidden on mobile to eliminate double navbars) */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 border-t border-[#F4EFE6]">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          
          <button
            onClick={() => setActiveTab('items')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'items'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-stone-100/70 text-stone-700 hover:bg-stone-200/60'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>المشتريات والضمانات</span>
          </button>

          <button
            onClick={() => setActiveTab('bills')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'bills'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-stone-100/70 text-stone-700 hover:bg-stone-200/60'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>الفواتير والمصاريف</span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-stone-100/70 text-stone-700 hover:bg-stone-200/60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>سجل الصيانة</span>
          </button>

          <button
            onClick={() => setActiveTab('water')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'water'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-stone-100/70 text-stone-700 hover:bg-stone-200/60'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>ماء العمارة (مأمون)</span>
          </button>

          <button
            onClick={() => setActiveTab('rent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'rent'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-stone-100/70 text-stone-700 hover:bg-stone-200/60'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>الإيجار السنوي</span>
          </button>

        </div>
      </div>

    </header>
  );
}
