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
    const rentJuneStatus = rentJune?.status === 'paid' ? 'تم الدفع 🟢' : 'مستحقة (10,000 ريال) 🔴';
    const rentDecStatus = rentDec?.status === 'paid' ? 'تم الدفع 🟢' : 'مستحقة (10,000 ريال) 🔴';

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
      
      {/* Row 1: Brand Logo, Tools, Search & Primary Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 border-b border-[#F4EFE6]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Brand Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('items')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-800 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-800/10">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-stone-900 tracking-tight">بيت العائلة</h1>
                  <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    الرئيسية
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium">سجل المشتريات، الضمانات، الفواتير والصيانة</p>
              </div>
            </div>

            {/* Mobile quick add button */}
            <button
              onClick={onOpenAddModal}
              className="md:hidden bg-amber-800 hover:bg-amber-900 text-white p-2.5 rounded-xl text-xs font-bold flex items-center justify-center shadow-xs"
              title="إضافة شراء جديد"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Tools & Search Bar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56 min-w-[180px]">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="بحث في المشتريات والضمانات والفواتير..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
              />
            </div>

            {/* WhatsApp Family Summary Button */}
            <button
              onClick={shareWhatsAppMonthlySummary}
              title="مشاركة ملخص التزامات الشهر عبر جروب العائلة بالواتساب"
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">ملخص الشهر بواتساب</span>
            </button>

            {/* Family Member Filter */}
            <select
              value={selectedFamilyMember}
              onChange={(e) => setSelectedFamilyMember(e.target.value)}
              className="bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl text-xs font-semibold text-stone-800 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="">جميع أفراد العائلة</option>
              {(familyMembers || []).map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>

            {/* Manage Family Members Button */}
            <button
              onClick={onOpenFamilyModal}
              title="إدارة أفراد العائلة"
              className="px-3 py-2 bg-[#FDFBF7] hover:bg-stone-100 text-stone-700 rounded-xl border border-[#EBE5DA] transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-800" />
              <span className="hidden sm:inline">العائلة</span>
            </button>

            {/* Export Dropdown Button */}
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="px-3 py-2 bg-[#FDFBF7] hover:bg-stone-100 text-stone-700 rounded-xl border border-[#EBE5DA] transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>تصدير</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {isExportOpen && (
                <div className="absolute left-0 mt-1.5 w-40 bg-white border border-[#EBE5DA] rounded-xl shadow-xl z-50 overflow-hidden py-1">
                  <button
                    onClick={() => {
                      setIsExportOpen(false);
                      onExport('csv');
                    }}
                    className="w-full text-right px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-amber-50 transition-colors flex items-center justify-between"
                  >
                    <span>ملف CSV</span>
                    <span className="text-[10px] text-stone-400 font-mono">.csv</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsExportOpen(false);
                      onExport('json');
                    }}
                    className="w-full text-right px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-amber-50 transition-colors flex items-center justify-between border-t border-stone-100"
                  >
                    <span>نسخة JSON</span>
                    <span className="text-[10px] text-stone-400 font-mono">.json</span>
                  </button>
                </div>
              )}
            </div>

            {/* Add Purchase Primary Button */}
            <button
              onClick={onOpenAddModal}
              className="hidden md:flex bg-amber-800 hover:bg-amber-900 text-white font-bold px-4 py-2 rounded-xl text-xs items-center gap-1.5 shadow-md shadow-amber-800/10 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة شراء جديد</span>
            </button>

          </div>

        </div>
      </div>

      {/* Row 2: Segmented Control Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          
          <button
            onClick={() => setActiveTab('items')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'items'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-[#FDFBF7] text-stone-700 hover:bg-stone-200/60 border border-[#EBE5DA]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>المشتريات والضمانات</span>
          </button>

          <button
            onClick={() => setActiveTab('bills')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'bills'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-[#FDFBF7] text-stone-700 hover:bg-stone-200/60 border border-[#EBE5DA]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>الفواتير والمصاريف</span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-[#FDFBF7] text-stone-700 hover:bg-stone-200/60 border border-[#EBE5DA]'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>سجل الصيانة 🛠️</span>
          </button>

          <button
            onClick={() => setActiveTab('water')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'water'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-[#FDFBF7] text-stone-700 hover:bg-stone-200/60 border border-[#EBE5DA]'
            }`}
          >
            <Droplets className="w-4 h-4 text-blue-600" />
            <span>ماء العمارة (مأمون)</span>
          </button>

          <button
            onClick={() => setActiveTab('rent')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'rent'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-[#FDFBF7] text-stone-700 hover:bg-stone-200/60 border border-[#EBE5DA]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>الإيجار السنوي</span>
          </button>

        </div>
      </div>

    </header>
  );
}
