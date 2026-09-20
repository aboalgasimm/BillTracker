'use client';

import React from 'react';
import { PieChart, DollarSign, Zap, Wifi, Shield, Car, Home, TrendingUp } from 'lucide-react';
import { Bill, RentPayment } from '@/types';

interface BudgetAnalyticsSectionProps {
  bills: Bill[];
  rentPayments: RentPayment[];
}

export default function BudgetAnalyticsSection({ bills, rentPayments }: BudgetAnalyticsSectionProps) {
  // Monthly Bills total
  const totalBillsMonthly = bills.reduce((sum, b) => sum + (b.amount || 0), 0);

  // Rent: 20,000 SAR / 12 months = 1,666.67 SAR / month
  const monthlyRentAmortized = 20000 / 12;

  // Total Combined Monthly Commitment
  const totalMonthlyCommitment = totalBillsMonthly + monthlyRentAmortized;

  // Category Aggregations
  const electricityTotal = bills.filter((b) => b.category === 'electricity').reduce((sum, b) => sum + b.amount, 0);
  const wifiTotal = bills.filter((b) => b.category === 'wifi').reduce((sum, b) => sum + b.amount, 0);
  const carTotal = bills.filter((b) => b.category === 'car_payment' || b.category === 'car_insurance').reduce((sum, b) => sum + b.amount, 0);
  const otherTotal = bills.filter((b) => b.category === 'other').reduce((sum, b) => sum + b.amount, 0);

  const categories = [
    {
      name: 'حصة إيجار الشقة (موزع شهرياً)',
      amount: monthlyRentAmortized,
      color: 'bg-amber-800',
      textColor: 'text-amber-900',
      icon: <Home className="w-4 h-4 text-amber-800" />
    },
    {
      name: 'أقساط وتأمين العربيات',
      amount: carTotal,
      color: 'bg-purple-600',
      textColor: 'text-purple-800',
      icon: <Car className="w-4 h-4 text-purple-600" />
    },
    {
      name: 'كهرباء الشقة',
      amount: electricityTotal,
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      icon: <Zap className="w-4 h-4 text-amber-600" />
    },
    {
      name: 'إنترنت ألياف STC',
      amount: wifiTotal,
      color: 'bg-blue-600',
      textColor: 'text-blue-800',
      icon: <Wifi className="w-4 h-4 text-blue-600" />
    },
    {
      name: 'مصاريف والتزامات أخرى',
      amount: otherTotal,
      color: 'bg-stone-500',
      textColor: 'text-stone-700',
      icon: <DollarSign className="w-4 h-4 text-stone-600" />
    }
  ];

  return (
    <div className="bg-white border border-[#EBE5DA] rounded-2xl p-5 shadow-sm mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[#F4EFE6] mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-100 shadow-sm">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">مخطط وميزانية الالتزامات الشهرية</h3>
            <p className="text-xs text-stone-500">
              توزيع تكاليف الفواتير وإيجار الشقة السنوي المحسوب شهرياً
            </p>
          </div>
        </div>

        <div className="text-left">
          <span className="text-[10px] text-stone-500 uppercase font-bold block">إجمالي الالتزام الشهري الشامل</span>
          <div className="text-xl font-black text-amber-900">
            {Math.round(totalMonthlyCommitment).toLocaleString('en-US')} <span className="text-xs font-bold text-stone-600">ريال / شهر</span>
          </div>
        </div>
      </div>

      {/* Progress Bars Stack */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">توزيع نسب المصاريف الشهرية</h4>

        {/* Unified Percentage Bar */}
        <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden flex shadow-inner">
          {categories.map((cat, idx) => {
            const pct = totalMonthlyCommitment > 0 ? (cat.amount / totalMonthlyCommitment) * 100 : 0;
            if (pct <= 0) return null;

            return (
              <div
                key={idx}
                className={`${cat.color} transition-all relative group`}
                style={{ width: `${pct}%` }}
                title={`${cat.name}: ${Math.round(pct)}%`}
              />
            );
          })}
        </div>

        {/* Category Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {categories.map((cat, idx) => {
            const pct = totalMonthlyCommitment > 0 ? Math.round((cat.amount / totalMonthlyCommitment) * 100) : 0;

            return (
              <div
                key={idx}
                className="bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white rounded-lg border border-stone-200 shadow-xs">
                    {cat.icon}
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">{cat.name}</span>
                    <span className="text-[11px] text-stone-500 font-semibold">{pct}% من الميزانية</span>
                  </div>
                </div>

                <div className="text-left font-black text-stone-900">
                  {Math.round(cat.amount).toLocaleString('en-US')} <span className="text-[10px] font-bold text-stone-500">ر.س</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
