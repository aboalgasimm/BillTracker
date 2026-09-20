'use client';

import React, { useState } from 'react';
import { CreditCard, Zap, Wifi, Shield, Car, Plus, CheckCircle2, AlertCircle, Share2, Edit3, Lock, RefreshCw } from 'lucide-react';
import { Bill, FamilyMember } from '@/types';

interface BillsSectionProps {
  bills: Bill[];
  familyMembers: FamilyMember[];
  onUpdateBill: (data: Partial<Bill>) => Promise<void>;
  onAddBill: (data: Partial<Bill>) => Promise<void>;
}

export default function BillsSection({ bills, familyMembers, onUpdateBill, onAddBill }: BillsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const [newBill, setNewBill] = useState({
    title: '',
    category: 'electricity',
    amount: '',
    due_day: 1,
    assigned_to: familyMembers[0]?.name || 'أبو القاسم',
    notes: ''
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'electricity':
        return <Zap className="w-5 h-5 text-amber-600" />;
      case 'wifi':
        return <Wifi className="w-5 h-5 text-blue-600" />;
      case 'car_insurance':
        return <Shield className="w-5 h-5 text-emerald-600" />;
      case 'car_payment':
        return <Car className="w-5 h-5 text-purple-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-stone-600" />;
    }
  };

  const filteredBills = bills.filter((b) => selectedCategory === 'all' || b.category === selectedCategory);
  const totalMonthlyAmount = bills.reduce((sum, b) => sum + (b.amount || 0), 0);

  const handleToggleStatus = async (bill: Bill) => {
    const newStatus = bill.status === 'paid' ? 'unpaid' : 'paid';
    const lastPaid = newStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined;
    await onUpdateBill({ id: bill.id, status: newStatus, last_paid_date: lastPaid });
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBill.title || !newBill.amount) return;

    await onAddBill({
      title: newBill.title,
      category: newBill.category,
      amount: parseFloat(newBill.amount) || 0,
      currency: 'ر.س',
      due_day: Number(newBill.due_day),
      status: 'unpaid',
      assigned_to: newBill.assigned_to,
      notes: newBill.notes
    });

    setNewBill({
      title: '',
      category: 'electricity',
      amount: '',
      due_day: 1,
      assigned_to: familyMembers[0]?.name || 'أبو القاسم',
      notes: ''
    });
    setIsModalOpen(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill) return;

    await onUpdateBill({
      id: editingBill.id,
      title: editingBill.title,
      category: editingBill.category,
      amount: Number(editingBill.amount),
      due_day: Number(editingBill.due_day),
      assigned_to: editingBill.assigned_to,
      notes: editingBill.notes
    });

    setEditingBill(null);
  };

  const shareWhatsAppReminder = (bill: Bill) => {
    const isVariable = bill.category === 'electricity';
    const noteText = isVariable ? ' (فاتورة متغيرة حسب الاستهلاك)' : '';
    const text = encodeURIComponent(
      `تذكير من بيت العائلة 🏠:\nفاتورة "${bill.title}" بمبلغ ${bill.amount} ريال${noteText} (المسؤول: ${bill.assigned_to}) مستحقة الدفع في يوم ${bill.due_day} من الشهر.\nيرجى السداد واختيار تم الدفع في التطبيق.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white border border-[#EBE5DA] rounded-2xl p-5 shadow-sm mb-6">
      
      {/* Header & Total Summary */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[#F4EFE6] mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-100 shadow-sm">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">الفواتير والمصاريف الشهرية</h3>
            <p className="text-xs text-stone-500">
              إجمالي الالتزامات الشهرية الحالية: <strong className="text-amber-900 font-bold">{totalMonthlyAmount.toLocaleString()} ريال سعودي</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-800 hover:bg-amber-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-800/10 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة فاتورة جديدة</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {[
          { id: 'all', name: 'جميع الفواتير' },
          { id: 'electricity', name: 'الكهرباء (متغيرة) ⚡' },
          { id: 'wifi', name: 'الإنترنت (287.5 ر.س ثابت) 📡' },
          { id: 'car_insurance', name: 'تأمين العربية 🛡️' },
          { id: 'car_payment', name: 'أقساط العربيات 🚗' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Bills Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBills.map((bill) => {
          const isPaid = bill.status === 'paid';
          const isElectricity = bill.category === 'electricity';
          const isWifi = bill.category === 'wifi';

          return (
            <div
              key={bill.id}
              className={`border rounded-2xl p-4 flex flex-col justify-between transition-all relative ${
                isPaid
                  ? 'bg-emerald-50/20 border-emerald-200'
                  : 'bg-[#FDFBF7] border-[#EBE5DA] hover:border-amber-400'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="p-2 bg-white rounded-xl border border-stone-200 shadow-xs flex items-center gap-2">
                    {getCategoryIcon(bill.category)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Fixed / Variable Type Badge */}
                    {isWifi && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" />
                        <span>مبلغ ثابت (287.5 ر.س)</span>
                      </span>
                    )}

                    {isElectricity && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <RefreshCw className="w-3 h-3" />
                        <span>متغيرة حسب الاستهلاك</span>
                      </span>
                    )}

                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم الدفع 🟢</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>مستحقة السداد 🔴</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold text-stone-900">{bill.title}</h4>
                  <button
                    onClick={() => setEditingBill(bill)}
                    title="تعديل الفاتورة والمبلغ"
                    className="p-1 text-stone-400 hover:text-amber-800 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-xl font-black text-amber-900 mb-3 flex items-baseline justify-between">
                  <div>
                    {bill.amount.toLocaleString()} <span className="text-xs font-semibold text-stone-600">ريال</span>
                  </div>
                  {isElectricity && (
                    <button
                      onClick={() => setEditingBill(bill)}
                      className="text-[11px] text-amber-800 font-bold hover:underline flex items-center gap-1 bg-amber-100/60 px-2 py-0.5 rounded-md cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>تحديث مبلغ هذا الشهر</span>
                    </button>
                  )}
                </div>

                <div className="text-xs text-stone-600 space-y-1.5 bg-white p-2.5 rounded-xl border border-stone-100 mb-3 font-medium">
                  <div className="flex justify-between">
                    <span className="text-stone-500">موعد الاستحقاق:</span>
                    <span className="font-bold text-stone-800">يوم {bill.due_day} من كل شهر</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">المسؤول:</span>
                    <span className="font-bold text-stone-800">{bill.assigned_to}</span>
                  </div>
                  {bill.notes && (
                    <div className="pt-1 border-t border-stone-100 text-[11px] text-stone-500">
                      💡 {bill.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#F4EFE6]">
                <button
                  onClick={() => handleToggleStatus(bill)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isPaid
                      ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {isPaid ? 'تغيير لغير مدفوع' : 'تأكيد السداد 🟢'}
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => setEditingBill(bill)}
                  title="تعديل المبلغ"
                  className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Share WhatsApp Reminder */}
                <button
                  onClick={() => shareWhatsAppReminder(bill)}
                  title="مشاركة تذكير السداد عبر واتساب"
                  className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Edit Bill Modal */}
      {editingBill && (
        <div
          onClick={() => setEditingBill(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE5DA] rounded-2xl w-full max-w-md p-5 shadow-2xl cursor-default"
          >
            <h3 className="text-base font-bold text-stone-900 mb-1">
              تعديل الفاتورة: {editingBill.title}
            </h3>
            {editingBill.category === 'electricity' && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mb-3 font-medium">
                ⚡️ فاتورة الكهرباء متغيرة شهرياً حسب استهلاك الشركة. يمكنك إدخال قيمة فاتورة الشهر الجديد هنا قبل السداد.
              </p>
            )}
            
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs mt-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">عنوان الفاتورة *</label>
                <input
                  type="text"
                  required
                  value={editingBill.title}
                  onChange={(e) => setEditingBill({ ...editingBill, title: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">المبلغ لـ هذا الشهر (ريال) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingBill.amount}
                    onChange={(e) => setEditingBill({ ...editingBill, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-amber-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">يوم الاستحقاق من الشهر</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editingBill.due_day}
                    onChange={(e) => setEditingBill({ ...editingBill, due_day: Number(e.target.value) })}
                    className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">المسؤول عن السداد *</label>
                <select
                  value={editingBill.assigned_to}
                  onChange={(e) => setEditingBill({ ...editingBill, assigned_to: e.target.value })}
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
                <label className="block text-stone-700 font-semibold mb-1">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={editingBill.notes || ''}
                  onChange={(e) => setEditingBill({ ...editingBill, notes: e.target.value })}
                  placeholder="مثال: فاتورة شهر يوليو بعد استخدام المكيفات"
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingBill(null)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-bold hover:bg-stone-200 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-800 text-white rounded-xl font-bold hover:bg-amber-900 shadow-sm cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE5DA] rounded-2xl w-full max-w-md p-5 shadow-2xl cursor-default"
          >
            <h3 className="text-base font-bold text-stone-900 mb-4">إضافة فاتورة أو التزام شهري جديد</h3>
            
            <form onSubmit={handleCreateBill} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">عنوان الفاتورة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فاتورة كهرباء الشقة"
                  value={newBill.title}
                  onChange={(e) => setNewBill({ ...newBill, title: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">التصنيف *</label>
                <select
                  value={newBill.category}
                  onChange={(e) => setNewBill({ ...newBill, category: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="electricity">كهرباء (متغيرة)</option>
                  <option value="wifi">إنترنت / واي فاي (287.5 ر.س ثابت)</option>
                  <option value="car_insurance">تأمين عربية</option>
                  <option value="car_payment">قسط عربية</option>
                  <option value="other">مصروف آخر</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">المبلغ (ريال) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="350"
                    value={newBill.amount}
                    onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                    className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">يوم الاستحقاق (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newBill.due_day}
                    onChange={(e) => setNewBill({ ...newBill, due_day: Number(e.target.value) })}
                    className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">المسؤول عن السداد *</label>
                <select
                  value={newBill.assigned_to}
                  onChange={(e) => setNewBill({ ...newBill, assigned_to: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  {familyMembers.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-bold hover:bg-stone-200 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-800 text-white rounded-xl font-bold hover:bg-amber-900 shadow-sm cursor-pointer"
                >
                  حفظ الفاتورة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
