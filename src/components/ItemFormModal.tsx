'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Camera, Calendar, Phone, DollarSign, Store, Tag, ShieldCheck, FileText, Check } from 'lucide-react';
import { Item, FamilyMember } from '@/types';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Partial<Item>) => Promise<void>;
  initialData?: Item | null;
  familyMembers: FamilyMember[];
}

const CATEGORIES = [
  'إلكترونيات',
  'أجهزة منزلية',
  'أدوات المطبخ',
  'تقنية وشخصية',
  'أثاث وديكور',
  'معدات وأدوات',
  'عربيات ومحركات',
  'رياضة وألعاب',
  'ملابس وإكسسوارات',
  'أخرى'
];

const WARRANTY_TYPES = [
  'ضمان الشركة المصنعة',
  'ضمان الموزع المعتمد',
  'ضمان المتجر الممتد',
  'تغطية البطاقة الائتمانية',
  'AppleCare+ حماية شاملة',
  'ضمان مدى الحياة',
  'بدون ضمان'
];

export default function ItemFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  familyMembers
}: ItemFormModalProps) {
  const [formData, setFormData] = useState<Partial<Item>>({
    name: '',
    category: 'إلكترونيات',
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: new Date().toISOString().split('T')[0],
    price: 0,
    currency: 'ر.س',
    purchased_by: familyMembers[0]?.name || 'أبو القاسم',
    store_name: '',
    store_phone: '',
    store_location: '',
    store_website: '',
    warranty_duration_months: 12,
    warranty_expiration: '',
    warranty_type: 'ضمان الشركة المصنعة',
    notes: '',
    receipt_url: ''
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [overrideExpiration, setOverrideExpiration] = useState(false);

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

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setOverrideExpiration(true);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const defaultName = familyMembers[0]?.name || 'أبو القاسم';
      
      const expDate = new Date();
      expDate.setMonth(expDate.getMonth() + 12);

      setFormData({
        name: '',
        category: 'إلكترونيات',
        brand: '',
        model: '',
        serial_number: '',
        purchase_date: today,
        price: 0,
        currency: 'ر.س',
        purchased_by: defaultName,
        store_name: '',
        store_phone: '',
        store_location: '',
        store_website: '',
        warranty_duration_months: 12,
        warranty_expiration: expDate.toISOString().split('T')[0],
        warranty_type: 'ضمان الشركة المصنعة',
        notes: '',
        receipt_url: ''
      });
      setOverrideExpiration(false);
    }
  }, [initialData, isOpen, familyMembers]);

  const updateCalculatedExpiration = (pDateStr: string, months: number) => {
    if (overrideExpiration) return;
    try {
      const pDate = new Date(pDateStr);
      if (!isNaN(pDate.getTime())) {
        pDate.setMonth(pDate.getMonth() + Number(months));
        setFormData((prev) => ({
          ...prev,
          warranty_expiration: pDate.toISOString().split('T')[0]
        }));
      }
    } catch (e) {}
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      setFormData((prev) => ({ ...prev, receipt_url: data.url }));
    } catch (error) {
      alert('فشل رفع ملف الفاتورة');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.purchase_date || !formData.purchased_by || !formData.store_name) {
      alert('يرجى ملء جميع الحقول المطلوبة المفعلة بـ *');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      alert('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#EBE5DA] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto cursor-default relative"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#F4EFE6] flex items-center justify-between bg-white sticky top-0 z-20">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-800" />
            <span>{initialData ? 'تعديل بيانات المشتريات' : 'إضافة شراء جديد للعائلة'}</span>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-stone-800 text-xs">
          
          {/* Section 1: Item Basic Info */}
          <div>
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2.5">
              1. مواصفات السلعة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              <div className="md:col-span-2">
                <label className="block text-stone-700 font-semibold mb-1">
                  اسم المنتج / الشراء *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تلفزيون إل جي 65 بوصة، مكنسة دايسون"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">التصنيف *</label>
                <select
                  value={formData.category || 'إلكترونيات'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">المشتري (فرد العائلة) *</label>
                <select
                  value={formData.purchased_by || familyMembers[0]?.name}
                  onChange={(e) => setFormData({ ...formData, purchased_by: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  {familyMembers.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">اسم الماركة / الشركة</label>
                <input
                  type="text"
                  placeholder="مثال: سوني، سامسونج، أبل، دايسون"
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">الموديل والسيريال نمبر (Serial #)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="رقم الموديل"
                    value={formData.model || ''}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-2.5 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-medium"
                  />
                  <input
                    type="text"
                    placeholder="السيريال نمبر"
                    value={formData.serial_number || ''}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-2.5 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-medium"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Store Contact Info */}
          <div>
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5">
              2. معلومات المتجر وتواصل البائع
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              <div>
                <label className="block text-stone-700 font-semibold mb-1">اسم المتجر / مكان الشراء *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: إكسترا، جرير، ساكو، أبل"
                  value={formData.store_name || ''}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">رقم هاتف المتجر للتواصل</label>
                <input
                  type="tel"
                  placeholder="مثال: +966 9200 04444"
                  value={formData.store_phone || ''}
                  onChange={(e) => setFormData({ ...formData, store_phone: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">تاريخ الشراء *</label>
                <input
                  type="date"
                  required
                  value={formData.purchase_date || ''}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setFormData({ ...formData, purchase_date: newDate });
                    updateCalculatedExpiration(newDate, formData.warranty_duration_months || 12);
                  }}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">السعر / التكلفة</label>
                <div className="flex gap-2">
                  <select
                    value={formData.currency || 'ر.س'}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-2 py-2 text-stone-900 font-bold"
                  >
                    <option value="ر.س">ريال (ر.س)</option>
                    <option value="$">$ (USD)</option>
                    <option value="€">€ (EUR)</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price ?? ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Warranty Details */}
          <div>
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2.5">
              3. معلومات وتغطية الضمان
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              <div>
                <label className="block text-stone-700 font-semibold mb-1">مدة الضمان (بالأشهر)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="12"
                  value={formData.warranty_duration_months ?? 12}
                  onChange={(e) => {
                    const months = parseInt(e.target.value) || 0;
                    setFormData({ ...formData, warranty_duration_months: months });
                    if (formData.purchase_date) {
                      updateCalculatedExpiration(formData.purchase_date, months);
                    }
                  }}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">نوع الضمان والتغطية</label>
                <select
                  value={formData.warranty_type || 'ضمان الشركة المصنعة'}
                  onChange={(e) => setFormData({ ...formData, warranty_type: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  {WARRANTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-stone-700 font-semibold">تاريخ انتهاء الضمان الرسمية</label>
                  <label className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrideExpiration}
                      onChange={(e) => setOverrideExpiration(e.target.checked)}
                      className="rounded border-[#EBE5DA] text-amber-800 focus:ring-amber-500"
                    />
                    <span>تعديل يدوي لتاريخ الضمان</span>
                  </label>
                </div>
                <input
                  type="date"
                  disabled={!overrideExpiration}
                  value={formData.warranty_expiration || ''}
                  onChange={(e) => setFormData({ ...formData, warranty_expiration: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60 font-medium"
                />
              </div>

            </div>
          </div>

          {/* Section 4: Receipt File with Camera Support */}
          <div>
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              4. إرفاق فاتورة الشراء أو تصويرها بالكاميرا
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1.5">صورة الفاتورة أو الضوء بالكاميرا</label>
                <div className="flex items-center gap-2 flex-wrap">
                  
                  {/* File Upload Button */}
                  <label className="flex items-center gap-2 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 border border-[#EBE5DA] rounded-xl cursor-pointer text-xs font-bold text-stone-800 transition-colors shadow-xs">
                    <Upload className="w-4 h-4 text-amber-800" />
                    <span>{uploading ? 'جاري الرفع...' : 'اختر ملف الفاتورة'}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>

                  {/* Direct Mobile Camera Capture */}
                  <label className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl cursor-pointer text-xs font-bold text-amber-900 transition-colors shadow-xs">
                    <Camera className="w-4 h-4 text-amber-800" />
                    <span>تصوير الفاتورة بالكاميرا 📸</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>

                  {formData.receipt_url && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 mr-2">
                      <Check className="w-4 h-4 text-emerald-600" /> تم إرفاق الفاتورة
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  placeholder="أضف أي تفاصيل أو ملاحظات خاصة بطلب الضمان..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#F4EFE6] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'جاري الحفظ...' : initialData ? 'تحديث البيانات' : 'حفظ الشراء'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
