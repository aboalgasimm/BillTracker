'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldX, Phone, Calendar, User, Tag, DollarSign, CalendarPlus, ExternalLink, Paperclip, Eye, Edit, Trash2 } from 'lucide-react';
import { Item, FamilyMember } from '@/types';

interface ItemCardProps {
  item: Item;
  familyMembers: FamilyMember[];
  onSelect: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
}

export default function ItemCard({ item, familyMembers, onSelect, onEdit, onDelete }: ItemCardProps) {
  const member = familyMembers.find((m) => m.name.toLowerCase() === item.purchased_by.toLowerCase());
  const memberColor = member?.avatar_color || '#2563EB';

  const renderStatusBadge = () => {
    switch (item.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>ضمان ساري</span>
          </span>
        );
      case 'expiring_soon':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>ينتهي قريباً ({item.days_remaining} يوم)</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            <ShieldX className="w-3.5 h-3.5 text-rose-600" />
            <span>ضمان منتهي</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-white border border-[#EBE5DA] hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between transition-all duration-150 shadow-xs hover:shadow-md cursor-pointer group relative overflow-hidden"
    >
      <div>
        {/* Top Bar: Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200 uppercase">
            {item.category}
          </span>
          {renderStatusBadge()}
        </div>

        {/* Item Title & Brand/Model */}
        <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-1">
          {item.name}
        </h3>
        <p className="text-xs text-stone-500 mb-3 flex items-center gap-2 font-medium">
          {item.brand && <span className="font-bold text-stone-800">{item.brand}</span>}
          {item.model && <span className="text-stone-400">موديل: {item.model}</span>}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-stone-700 bg-[#FDFBF7] p-2.5 rounded-xl border border-[#EBE5DA] mb-3">
          <div>
            <span className="text-[10px] text-stone-500 block font-bold">تاريخ الشراء</span>
            <span className="font-bold text-stone-800">{item.purchase_date}</span>
            {item.price > 0 && (
              <span className="text-emerald-700 font-extrabold block mt-0.5">
                {item.price.toLocaleString()} {item.currency}
              </span>
            )}
          </div>

          <div>
            <span className="text-[10px] text-stone-500 block font-bold">نهاية الضمان</span>
            <span className={`font-bold ${
              item.status === 'expiring_soon' ? 'text-amber-800' : item.status === 'expired' ? 'text-rose-700' : 'text-stone-800'
            }`}>
              {item.warranty_expiration}
            </span>
            <span className="text-[10px] text-stone-500 block mt-0.5 truncate font-medium">
              {item.warranty_type}
            </span>
          </div>
        </div>

        {/* Store & Contact Info */}
        <div className="text-xs text-stone-600 space-y-1 mb-3">
          <div className="flex items-center justify-between">
            <span className="truncate font-medium">المتجر: <span className="text-stone-900 font-bold">{item.store_name}</span></span>
            {item.receipt_url && (
              <span className="flex items-center gap-1 text-[11px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md shrink-0 font-bold">
                <Paperclip className="w-3 h-3" />
                الفاتورة
              </span>
            )}
          </div>

          {item.store_phone && (
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <a
                href={`tel:${item.store_phone}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline text-xs"
              >
                {item.store_phone}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Purchased By & Explicit Action Buttons */}
      <div className="border-t border-[#F4EFE6] pt-2.5 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: memberColor }}
          />
          <span className="text-xs font-bold text-stone-700">
            {item.purchased_by}
          </span>
        </div>

        {/* Card Buttons with Fix */}
        <div className="flex items-center gap-1">
          <a
            href={`/api/calendar/${item.id}`}
            download
            onClick={(e) => e.stopPropagation()}
            title="تصدير للتقويم (.ics)"
            className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
          </a>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            title="عرض التفاصيل"
            className="px-2 py-1 text-amber-900 hover:bg-amber-50 rounded-lg transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>تفاصيل</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            title="تعديل"
            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors text-xs font-bold cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`هل أنت تأكد من حذف "${item.name}"؟`)) {
                onDelete(item.id);
              }
            }}
            title="حذف"
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs font-bold cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
