'use client';

import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Item } from '@/types';

interface ExpirationAlertBannerProps {
  expiringItems: Item[];
  onSelectItem: (item: Item) => void;
}

export default function ExpirationAlertBanner({ expiringItems, onSelectItem }: ExpirationAlertBannerProps) {
  if (!expiringItems || expiringItems.length === 0) return null;

  return (
    <div className="mb-4 bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 px-3 flex items-center justify-between text-xs text-amber-900 shadow-xs">
      <div className="flex items-center gap-2 truncate">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
        <span className="font-bold truncate">
          ضمان ينتهي قريباً: <span className="underline">{expiringItems[0].name}</span> (متبقي {expiringItems[0].days_remaining} يوم)
        </span>
      </div>

      <button
        onClick={() => onSelectItem(expiringItems[0])}
        className="text-[11px] font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 shrink-0 bg-white px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer"
      >
        <span>التفاصيل</span>
        <ArrowLeft className="w-3 h-3" />
      </button>
    </div>
  );
}
