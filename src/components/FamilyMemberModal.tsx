'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Plus, Check } from 'lucide-react';
import { FamilyMember } from '@/types';

interface FamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyMembers: FamilyMember[];
  onAddMember: (name: string, color: string) => Promise<void>;
}

const COLOR_PALETTE = [
  '#2563EB', // Blue
  '#DB2777', // Pink
  '#059669', // Green
  '#7C3AED', // Purple
  '#EA580C', // Orange
  '#0891B2', // Cyan
  '#4F46E5', // Indigo
  '#CA8A04'  // Yellow
];

export default function FamilyMemberModal({
  isOpen,
  onClose,
  familyMembers,
  onAddMember
}: FamilyMemberModalProps) {
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#2563EB');
  const [loading, setLoading] = useState(false);

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setLoading(true);
    try {
      await onAddMember(newMemberName.trim(), selectedColor);
      setNewMemberName('');
    } catch (error) {
      alert('فشل إضافة فرد العائلة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#EBE5DA] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto cursor-default relative"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#F4EFE6] flex items-center justify-between bg-white">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-800" />
            <span>إدارة أفراد العائلة</span>
          </h2>

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

        {/* Content */}
        <div className="p-5 space-y-4 text-stone-800 text-xs">
          
          {/* Current Members List */}
          <div>
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
              أفراد العائلة المسجلين حالياً
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {familyMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between bg-[#FDFBF7] p-2.5 rounded-xl border border-[#EBE5DA]"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: m.avatar_color }}
                    />
                    <span className="font-bold text-stone-900 text-sm">{m.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Member Form */}
          <form onSubmit={handleAdd} className="border-t border-[#F4EFE6] pt-3.5 space-y-3">
            <h3 className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
              إضافة فرد عائلة جديد
            </h3>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">الاسم</label>
              <input
                type="text"
                required
                placeholder="أدخل الاسم..."
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1.5">لون التاج المُميز</label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && <Check className="w-4 h-4 text-white drop-shadow-xs" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !newMemberName.trim()}
              className="w-full mt-2 bg-amber-800 hover:bg-amber-900 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'جاري الإضافة...' : 'إضافة الفرد'}</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
