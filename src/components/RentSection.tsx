'use client';

import React, { useState } from 'react';
import { Home, Calendar, CheckCircle2, AlertCircle, Upload, Paperclip, Check } from 'lucide-react';
import { RentPayment } from '@/types';

interface RentSectionProps {
  rentPayments: RentPayment[];
  onUpdateRent: (data: Partial<RentPayment>) => Promise<void>;
}

export default function RentSection({ rentPayments, onUpdateRent }: RentSectionProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleToggleStatus = async (rent: RentPayment) => {
    setLoadingId(rent.id);
    try {
      const newStatus = rent.status === 'paid' ? 'unpaid' : 'paid';
      const paidDate = newStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined;

      await onUpdateRent({
        id: rent.id,
        status: newStatus,
        paid_date: paidDate
      });
    } catch (e) {
      alert('حدث خطأ أثناء تحديث دفعة الإيجار');
    } finally {
      setLoadingId(null);
    }
  };

  const handleFileUpload = async (rentId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingId(rentId);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      await onUpdateRent({
        id: rentId,
        receipt_url: data.url
      });
    } catch (error) {
      alert('فشل رفع إيصال التحويل');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white border border-[#EBE5DA] rounded-2xl p-5 shadow-sm mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[#F4EFE6] mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-100 shadow-sm">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">إيجار الشقة السنوي (20,000 ريال)</h3>
            <p className="text-xs text-stone-500">
              يسدد الإيجار على دفعتين متساويتين (10,000 ريال في يونيو و 10,000 ريال في ديسمبر)
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-amber-900 bg-amber-100/80 border border-amber-200 px-3 py-1 rounded-xl">
          10,000 ريال / نصف سنوي
        </span>
      </div>

      {/* Grid of Two Payments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rentPayments.map((rent) => {
          const isPaid = rent.status === 'paid';
          const isJune = rent.due_month === 'june';

          return (
            <div
              key={rent.id}
              className={`border rounded-2xl p-4.5 flex flex-col justify-between transition-all ${
                isPaid
                  ? 'bg-emerald-50/30 border-emerald-200'
                  : 'bg-[#FDFBF7] border-[#EBE5DA] hover:border-amber-400'
              }`}
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200">
                    {isJune ? 'دفعة شهر يونيو (6)' : 'دفعة شهر ديسمبر (12)'}
                  </span>
                  
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تم سداد الإيجار 🟢</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>مستحقة السداد 🔴</span>
                    </span>
                  )}
                </div>

                {/* Payment Title & Amount */}
                <h4 className="text-base font-bold text-stone-900 mb-1">{rent.title}</h4>
                <div className="text-2xl font-black text-amber-900 mb-3">
                  10,000 <span className="text-xs font-semibold text-stone-600">ريال سعودي</span>
                </div>

                <div className="text-xs text-stone-600 space-y-1 bg-white p-3 rounded-xl border border-[#EBE5DA] mb-4">
                  <div className="flex justify-between">
                    <span className="text-stone-500">موعد الاستحقاق:</span>
                    <span className="font-bold text-stone-800">{isJune ? '1 يونيو' : '1 ديسمبر'}</span>
                  </div>
                  {rent.paid_date && (
                    <div className="flex justify-between text-emerald-700 font-semibold border-t border-stone-100 pt-1">
                      <span>تاريخ التحويل:</span>
                      <span>{rent.paid_date}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons & Receipt */}
              <div className="space-y-2 pt-2 border-t border-[#F4EFE6]">
                <button
                  onClick={() => handleToggleStatus(rent)}
                  disabled={loadingId === rent.id}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                    isPaid
                      ? 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isPaid ? 'تغيير الحالة إلى غير مدفوع' : 'تأكيد تسديد الـ 10,000 ريال'}</span>
                </button>

                {/* Upload Receipt */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="text-stone-500 hover:text-stone-800 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5 text-amber-700" />
                    <span>{rent.receipt_url ? 'تغيير إيصال التحويل' : 'إرفاق إيصال تحويل الحساب'}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(rent.id, e)}
                      className="hidden"
                    />
                  </label>

                  {rent.receipt_url && (
                    <a
                      href={rent.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-800 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>عرض الإيصال</span>
                    </a>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
