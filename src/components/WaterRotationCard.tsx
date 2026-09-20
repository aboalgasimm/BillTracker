'use client';

import React, { useState } from 'react';
import { Droplets, CheckCircle2, User, RefreshCw, AlertCircle, Info, Calendar } from 'lucide-react';
import { WaterRotation } from '@/types';

interface WaterRotationCardProps {
  rotation: WaterRotation | null;
  onUpdate: (data: any) => Promise<void>;
}

export default function WaterRotationCard({ rotation, onUpdate }: WaterRotationCardProps) {
  const [loading, setLoading] = useState(false);

  if (!rotation) return null;

  const currentCount = rotation.current_turn_count;
  const totalTurns = rotation.total_turns_per_cycle || 4;
  const isOurTurn = rotation.is_our_turn;

  const handleRecordPayment = async () => {
    setLoading(true);
    try {
      await onUpdate({ action: 'increment_turn' });
    } catch (e) {
      alert('حدث خطأ أثناء تحديث الفاتورة');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTurn = async () => {
    setLoading(true);
    try {
      await onUpdate({ action: 'toggle_turn' });
    } catch (e) {
      alert('حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#EBE5DA] rounded-2xl p-5 shadow-sm mb-6">
      
      {/* Card Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[#F4EFE6]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shadow-sm">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-stone-900">{rotation.building_name}</h3>
              <span className="text-xs bg-blue-100 text-blue-800 font-medium px-2.5 py-0.5 rounded-full">
                نظام دورة العمارة
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>المسؤول عن الدفع والمتابعة: <strong className="text-stone-800">{rotation.assigned_to}</strong></span>
            </p>
          </div>
        </div>

        {/* Turn Status Pill */}
        <div>
          {isOurTurn ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>الدور على شقتنا الآن 🟢</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-stone-100 text-stone-600 border border-stone-200">
              <span>انتظار دور الشقق الأخرى ⏳</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Content & Turn Progress */}
      <div className="py-4 space-y-4">
        
        {/* Explanation Rule */}
        <div className="bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl p-3.5 text-xs text-stone-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-stone-800">قانون ماء العمارة:</p>
            <p className="mt-0.5">
              كل شقة في العمارة تلتزم بدفع فاتورة المياه <strong>{totalTurns} مرات متتالية</strong>، ثم تنتقل الدورة للشقة المجاورة بترتيب دائم.
            </p>
          </div>
        </div>

        {/* Progress Tracker */}
        {isOurTurn ? (
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-center">
            <span className="text-xs text-blue-900 font-semibold uppercase tracking-wider block mb-1">
              مستوى تقدم الدورة الحالي
            </span>
            
            <div className="text-2xl font-black text-blue-950 mb-3">
              الدفعة رقم <span className="text-blue-700">{currentCount}</span> من أصل <span className="text-stone-700">{totalTurns}</span>
            </div>

            {/* Visual Step Bubbles */}
            <div className="flex items-center justify-center gap-2 max-w-xs mx-auto mb-4">
              {Array.from({ length: totalTurns }).map((_, index) => {
                const stepNum = index + 1;
                const isDone = stepNum < currentCount;
                const isCurrent = stepNum === currentCount;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full h-3 rounded-full transition-all ${
                        isDone
                          ? 'bg-emerald-500'
                          : isCurrent
                          ? 'bg-blue-600 ring-2 ring-blue-300 animate-pulse'
                          : 'bg-stone-200'
                      }`}
                    />
                    <span className="text-[10px] font-bold text-stone-500">
                      #{stepNum}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Payment Action Button */}
            <button
              onClick={handleRecordPayment}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'جاري التسجيل...' : `تسجيل سداد الدفعة #${currentCount} (بواسطة ${rotation.assigned_to})`}
            </button>
          </div>
        ) : (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-center">
            <p className="text-xs text-stone-600 mb-2">
              حالياً الدور على إحدى الشقق الأخرى في العمارة. عند انتهاء دورهم وعودة الدور لشقتنا، يمكنك تفعيل الدور بالضغط على الزر أدناه:
            </p>
            <button
              onClick={handleToggleTurn}
              disabled={loading}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl transition-all"
            >
              تفعيل الدور لشقتنا الآن (بدء الدفعة 1 من 4)
            </button>
          </div>
        )}

        {/* Footer Details */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-[#F4EFE6] flex-wrap gap-2">
          {rotation.last_payment_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>آخر سداد مسجل: <strong className="text-stone-700">{rotation.last_payment_date}</strong></span>
            </span>
          )}

          <button
            onClick={handleToggleTurn}
            className="text-xs text-stone-600 hover:text-stone-900 underline font-medium"
          >
            {isOurTurn ? 'تحويل الدور لشقة أخرى' : 'استعادة الدور لشقتنا'}
          </button>
        </div>

      </div>
    </div>
  );
}
