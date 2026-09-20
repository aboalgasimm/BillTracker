'use client';

import React from 'react';
import { AlertTriangle, Phone, CalendarPlus, ArrowLeft, Share2 } from 'lucide-react';
import { Item } from '@/types';

interface ExpirationAlertBannerProps {
  expiringItems: Item[];
  onSelectItem: (item: Item) => void;
}

export default function ExpirationAlertBanner({ expiringItems, onSelectItem }: ExpirationAlertBannerProps) {
  if (!expiringItems || expiringItems.length === 0) return null;

  const shareWhatsAppWarrantyAlert = (item: Item) => {
    const text = encodeURIComponent(
      `تنبيه ضمان من بيت العائلة 🏠:\nضمان "${item.name}" سينتهي بعد ${item.days_remaining} يوم بتاريخ (${item.warranty_expiration}).\nرقم المتجر (${item.store_name}): ${item.store_phone || 'غير مسجل'}.\nالسيريال نمبر: ${item.serial_number || 'غير مسجل'}.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-white border border-amber-300 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5 animate-bounce">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-bold text-amber-900">
              ⚠️ تنبيه هام: يوجد {expiringItems.length} {expiringItems.length === 1 ? 'ضمان ينتهي قريباً' : 'ضمانات تنتهي قريباً'}!
            </h3>
            <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
              خلال 30 يوماً
            </span>
          </div>

          <p className="text-xs text-stone-600 mb-3">
            يرجى مراجعة فواتير الشراء والتواصل مع المتجر قبل انتهاء فترة الضمان الرسمية.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {expiringItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-amber-200 hover:border-amber-400 rounded-xl p-3 flex flex-col justify-between text-xs transition-all shadow-xs group"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="font-bold text-stone-900 truncate group-hover:text-amber-800">
                      {item.name}
                    </span>
                    <span className="shrink-0 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md text-[11px]">
                      متبقي {item.days_remaining} يوم
                    </span>
                  </div>

                  <div className="text-stone-500 text-[11px] space-y-0.5 mb-2">
                    <div>المتجر: <span className="text-stone-800 font-medium">{item.store_name}</span></div>
                    {item.store_phone && (
                      <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <Phone className="w-3 h-3 shrink-0" />
                        <a href={`tel:${item.store_phone}`} className="hover:underline">
                          {item.store_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-2 mt-1">
                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/calendar/${item.id}`}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-900 font-bold"
                      title="تصدير ملف التقويم للآيفون وجوجل"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>للتقويم</span>
                    </a>

                    <button
                      onClick={() => shareWhatsAppWarrantyAlert(item)}
                      title="مشاركة التنبيه عبر واتساب"
                      className="text-emerald-700 hover:text-emerald-800 p-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectItem(item)}
                    className="flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-900 font-bold"
                  >
                    <span>تفاصيل الضمان</span>
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
