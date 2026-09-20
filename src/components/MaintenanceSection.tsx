'use client';

import React, { useState } from 'react';
import { Wrench, Car, Home as HomeIcon, Tv, CheckCircle2, AlertTriangle, Plus, Calendar, User, DollarSign, RefreshCw } from 'lucide-react';
import { MaintenanceTask, FamilyMember } from '@/types';

interface MaintenanceSectionProps {
  tasks: MaintenanceTask[];
  familyMembers: FamilyMember[];
  onUpdateTask: (data: any) => Promise<void>;
  onAddTask: (data: any) => Promise<void>;
}

export default function MaintenanceSection({
  tasks,
  familyMembers,
  onUpdateTask,
  onAddTask
}: MaintenanceSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const [newTask, setNewTask] = useState({
    title: '',
    category: 'car',
    item_name: '',
    frequency_months: 6,
    last_service_date: new Date().toISOString().split('T')[0],
    cost: '',
    assigned_to: familyMembers[0]?.name || 'أبو القاسم',
    notes: ''
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'car':
        return <Car className="w-5 h-5 text-amber-800" />;
      case 'appliance':
        return <Tv className="w-5 h-5 text-blue-600" />;
      case 'home':
        return <HomeIcon className="w-5 h-5 text-emerald-600" />;
      default:
        return <Wrench className="w-5 h-5 text-stone-600" />;
    }
  };

  const filteredTasks = tasks.filter((t) => selectedCategory === 'all' || t.category === selectedCategory);

  const handleCompleteService = async (task: MaintenanceTask) => {
    setLoadingId(task.id);
    try {
      await onUpdateTask({ id: task.id, action: 'complete_service' });
    } catch (e) {
      alert('حدث خطأ أثناء تحديث الصيانة');
    } finally {
      setLoadingId(null);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.last_service_date) return;

    await onAddTask({
      title: newTask.title,
      category: newTask.category,
      item_name: newTask.item_name,
      frequency_months: Number(newTask.frequency_months),
      last_service_date: newTask.last_service_date,
      cost: parseFloat(newTask.cost) || 0,
      currency: 'ر.س',
      assigned_to: newTask.assigned_to,
      notes: newTask.notes
    });

    setNewTask({
      title: '',
      category: 'car',
      item_name: '',
      frequency_months: 6,
      last_service_date: new Date().toISOString().split('T')[0],
      cost: '',
      assigned_to: familyMembers[0]?.name || 'أبو القاسم',
      notes: ''
    });
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white border border-[#EBE5DA] rounded-2xl p-5 shadow-sm mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[#F4EFE6] mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-100 shadow-sm">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">سجل صيانة الأجهزة والعربيات</h3>
            <p className="text-xs text-stone-500">
              تتبع مواعيد الصيانة الدورية (تغيير زيت العربية، فلاتر المكيفات، صيانة المطبخ)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-800 hover:bg-amber-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-800/10 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مهمة صيانة جديدة</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {[
          { id: 'all', name: 'جميع الصيانات' },
          { id: 'car', name: 'صيانة العربيات 🚗' },
          { id: 'appliance', name: 'الأجهزة المنزلية 🔌' },
          { id: 'home', name: 'المنزل والسباكة 🏠' }
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

      {/* Maintenance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => {
          const isOverdue = task.status === 'overdue';
          const isDueSoon = task.status === 'due_soon';

          return (
            <div
              key={task.id}
              className={`border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                isOverdue
                  ? 'bg-rose-50/40 border-rose-200'
                  : isDueSoon
                  ? 'bg-amber-50/40 border-amber-300'
                  : 'bg-[#FDFBF7] border-[#EBE5DA] hover:border-amber-400'
              }`}
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="p-2 bg-white rounded-xl border border-stone-200 shadow-xs">
                    {getCategoryIcon(task.category)}
                  </div>

                  {isOverdue ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>صيانة مستحقة الآن 🔴</span>
                    </span>
                  ) : isDueSoon ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full animate-bounce">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>موعد الصيانة قريباً ({task.days_remaining} يوم)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>صيانة سارية 🟢</span>
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-stone-900 mb-0.5">{task.title}</h4>
                {task.item_name && (
                  <p className="text-xs text-stone-500 font-semibold mb-3">{task.item_name}</p>
                )}

                <div className="text-xs text-stone-700 space-y-1 bg-white p-2.5 rounded-xl border border-stone-100 mb-3 font-medium">
                  <div className="flex justify-between">
                    <span className="text-stone-500">التكرار الدوري:</span>
                    <span className="font-bold text-stone-800">كل {task.frequency_months} أشهر</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">آخر صيانة:</span>
                    <span className="font-bold text-stone-800">{task.last_service_date}</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-100 pt-1">
                    <span className="text-stone-500">الصيانة القادمة:</span>
                    <span className={`font-bold ${isOverdue ? 'text-rose-700' : isDueSoon ? 'text-amber-800' : 'text-stone-900'}`}>
                      {task.next_service_date}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-stone-100 pt-1">
                    <span className="text-stone-500">المسؤول:</span>
                    <span className="font-bold text-stone-900">{task.assigned_to}</span>
                  </div>
                </div>
              </div>

              {/* Complete Action Button */}
              <button
                onClick={() => handleCompleteService(task)}
                disabled={loadingId === task.id}
                className="w-full py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingId === task.id ? 'animate-spin' : ''}`} />
                <span>تسجيل إنجاز الصيانة اليوم</span>
              </button>

            </div>
          );
        })}
      </div>

      {/* Add Maintenance Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE5DA] rounded-2xl w-full max-w-md p-5 shadow-2xl cursor-default"
          >
            <h3 className="text-base font-bold text-stone-900 mb-4">إضافة مهمة صيانة دورية جديدة</h3>
            
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">اسم المهمة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تغيير زيت المحرك والفلتر"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">اسم الجهاز أو العربية</label>
                <input
                  type="text"
                  placeholder="مثال: كامري 2024، مكيفات الصالة"
                  value={newTask.item_name}
                  onChange={(e) => setNewTask({ ...newTask, item_name: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">التصنيف *</label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="car">عربيات 🚗</option>
                    <option value="appliance">أجهزة منزلية 🔌</option>
                    <option value="home">منزل وسباكة 🏠</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">التكرار (كل كم شهر؟)</label>
                  <input
                    type="number"
                    min="1"
                    value={newTask.frequency_months}
                    onChange={(e) => setNewTask({ ...newTask, frequency_months: Number(e.target.value) })}
                    className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">تاريخ آخر صيانة *</label>
                <input
                  type="date"
                  required
                  value={newTask.last_service_date}
                  onChange={(e) => setNewTask({ ...newTask, last_service_date: e.target.value })}
                  className="w-full bg-[#FDFBF7] border border-[#EBE5DA] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">المسؤول عن المتابعة *</label>
                <select
                  value={newTask.assigned_to}
                  onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
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
                  حفظ الصيانة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
