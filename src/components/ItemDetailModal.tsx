'use client';

import React, { useEffect } from 'react';
import { X, Phone, Calendar, CalendarPlus, ShieldCheck, AlertTriangle, ShieldX, MapPin, Globe, Paperclip, Edit, Trash2, User, Tag, ExternalLink, Share2 } from 'lucide-react';
import { Item, FamilyMember } from '@/types';

interface ItemDetailModalProps {
  isOpen?: boolean;
  item: Item | null;
  familyMembers: FamilyMember[];
  onClose: () => void;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
}

export default function ItemDetailModal({
  isOpen = true,
  item,
  familyMembers,
  onClose,
  onEdit,
  onDelete
}: ItemDetailModalProps) {
  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen && item) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, item, onClose]);

  if (!isOpen || !item) return null;

  const member = familyMembers.find((m) => m.name.toLowerCase() === item.purchased_by.toLowerCase());
  const memberColor = member?.avatar_color || '#2563EB';

  const shareWhatsAppWarrantyAlert = () => {
    const text = encodeURIComponent(
      `معلومات ضمان من بيت العائلة 🏠:\nالمنتج: "${item.name}"\nتاريخ نهاية الضمان: (${item.warranty_expiration})\nالمتجر: ${item.store_name} - هاتف: ${item.store_phone || 'غير مسجل'}\nالسيريال نمبر: ${item.serial_number || 'غير مسجل'}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const renderStatusCard = () => {
    switch (item.status) {
      case 'active':
        return (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900">الضمان ساري ومحمّي 🟢</h4>
                <p className="text-xs text-emerald-800 font-medium">
                  متبقي {item.days_remaining} يوم في فترة الضمان الرسمية (ينتهي بتاريخ: {item.warranty_expiration})
                </p>
              </div>
            </div>
          </div>
        );
      case 'expiring_soon':
        return (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-900 rounded-xl animate-bounce">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">⚠️ تنبيه: الضمان ينتهي قريباً!</h4>
                <p className="text-xs text-amber-900 font-bold">
                  ينتهي خلال {item.days_remaining} يوماً ({item.warranty_expiration})
                </p>
              </div>
            </div>
          </div>
        );
      case 'expired':
        return (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 text-rose-800 rounded-xl">
                <ShieldX className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-900">الضمان انتهى 🔴</h4>
                <p className="text-xs text-rose-800 font-medium">
                  انتهى بتاريخ {item.warranty_expiration} (منذ {Math.abs(item.days_remaining || 0)} يوماً)
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    /* Outer Backdrop with Click-to-Close */
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto cursor-pointer"
    >
      {/* Inner Modal Box */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#EBE5DA] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto cursor-default relative"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#F4EFE6] flex items-center justify-between bg-white sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200 uppercase">
                {item.category}
              </span>
              <span className="text-xs text-stone-500 font-mono">ID #{item.id}</span>
            </div>
            <h2 className="text-lg font-bold text-stone-900 mt-1">{item.name}</h2>
          </div>

          {/* Close X Button with Fix */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            aria-label="إغلاق"
            className="w-9 h-9 flex items-center justify-center text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors shrink-0 cursor-pointer border border-stone-200 shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-stone-800 text-xs">
          
          {renderStatusCard()}

          {/* Store Quick Call Box */}
          <div className="bg-[#FDFBF7] border border-[#EBE5DA] rounded-2xl p-4">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
              <div>
                <span className="text-[10px] text-stone-500 font-bold uppercase block">اسم المتجر والبائع</span>
                <h3 className="text-base font-bold text-stone-900">{item.store_name}</h3>
                {item.store_location && (
                  <p className="text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{item.store_location}</span>
                  </p>
                )}
              </div>

              {item.store_phone ? (
                <a
                  href={`tel:${item.store_phone}`}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-700/20 transition-all active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>الاتصال بالمتجر ({item.store_phone})</span>
                </a>
              ) : (
                <span className="text-xs text-stone-500 italic font-medium">لا يوجد رقم هاتف مسجل</span>
              )}
            </div>

            {item.store_website && (
              <div className="border-t border-[#EBE5DA] pt-2 flex items-center gap-1.5 text-xs text-blue-700 font-bold">
                <Globe className="w-3.5 h-3.5" />
                <a href={item.store_website} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                  <span>زيارة موقع المتجر الإلكتروني</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-[#EBE5DA] text-xs">
            <div>
              <span className="text-[10px] text-stone-500 block font-semibold">الماركة</span>
              <span className="font-bold text-stone-900">{item.brand || 'غير مسجل'}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block font-semibold">الموديل</span>
              <span className="font-bold text-stone-900">{item.model || 'غير مسجل'}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block font-semibold">السيريال نمبر</span>
              <span className="font-mono font-bold text-amber-900 select-all">{item.serial_number || 'غير مسجل'}</span>
            </div>

            <div>
              <span className="text-[10px] text-stone-500 block font-semibold">تاريخ الشراء</span>
              <span className="font-bold text-stone-900">{item.purchase_date}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block font-semibold">السعر</span>
              <span className="font-bold text-emerald-700">{item.price.toLocaleString()} {item.currency}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block font-semibold">المشتري</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: memberColor }} />
                <span className="font-bold text-stone-900">{item.purchased_by}</span>
              </div>
            </div>
          </div>

          {/* Warranty Type */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#EBE5DA] text-xs space-y-1">
            <span className="text-[10px] text-stone-500 block font-semibold">نوع تغطية الضمان</span>
            <span className="font-bold text-stone-900">{item.warranty_type} ({item.warranty_duration_months} شهراً)</span>
          </div>

          {/* Notes */}
          {item.notes && (
            <div>
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">الملاحظات</h4>
              <p className="text-xs text-stone-800 bg-[#FDFBF7] p-3 rounded-xl border border-[#EBE5DA] whitespace-pre-line font-medium">
                {item.notes}
              </p>
            </div>
          )}

          {/* Receipt View */}
          {item.receipt_url && (
            <div>
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 text-amber-800" />
                <span>فاتورة الشراء المرفقة</span>
              </h4>
              <div className="bg-[#FDFBF7] p-2 rounded-2xl border border-[#EBE5DA]">
                <a
                  href={item.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative group overflow-hidden rounded-xl"
                >
                  <img
                    src={item.receipt_url}
                    alt="Receipt"
                    className="w-full max-h-60 object-contain rounded-xl bg-white"
                  />
                  <div className="text-xs text-center py-2 text-amber-900 font-bold hover:underline">
                    فتح وثيقة الفاتورة الأصلية
                  </div>
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[#F4EFE6] bg-white flex items-center justify-between gap-2 flex-wrap">
          
          <div className="flex items-center gap-2">
            <a
              href={`/api/calendar/${item.id}`}
              download
              className="px-3 py-2 bg-[#FDFBF7] hover:bg-amber-50 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[#EBE5DA] transition-colors shadow-xs"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>إضافة للتقويم (.ics)</span>
            </a>

            <button
              onClick={shareWhatsAppWarrantyAlert}
              className="px-3 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors shadow-xs cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>واتساب</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>تعديل</span>
            </button>
            <button
              onClick={() => {
                if (confirm(`هل أنت تأكد من حذف "${item.name}"؟`)) {
                  onDelete(item.id);
                  onClose();
                }
              }}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
