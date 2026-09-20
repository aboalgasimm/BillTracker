'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import MobileBottomNav from '@/components/MobileBottomNav';
import StatCards from '@/components/StatCards';
import ExpirationAlertBanner from '@/components/ExpirationAlertBanner';
import ItemCard from '@/components/ItemCard';
import ItemFormModal from '@/components/ItemFormModal';
import ItemDetailModal from '@/components/ItemDetailModal';
import FamilyMemberModal from '@/components/FamilyMemberModal';
import BillsSection from '@/components/BillsSection';
import WaterRotationCard from '@/components/WaterRotationCard';
import RentSection from '@/components/RentSection';
import MaintenanceSection from '@/components/MaintenanceSection';
import BudgetAnalyticsSection from '@/components/BudgetAnalyticsSection';
import { Item, FamilyMember, Bill, WaterRotation, RentPayment, MaintenanceTask, StatsOverview } from '@/types';
import { Package, Plus } from 'lucide-react';

const CATEGORIES = [
  'جميع التصنيفات',
  'إلكترونيات',
  'أجهزة منزلية',
  'أدوات المطبخ',
  'تقنية وشخصية',
  'أثاث وديكور',
  'معدات وأدوات',
  'سيارات ومحركات',
  'رياضة وألعاب',
  'ملابس وإكسسوارات',
  'أخرى'
];

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [waterRotation, setWaterRotation] = useState<WaterRotation | null>(null);
  const [rentPayments, setRentPayments] = useState<RentPayment[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'items' | 'bills' | 'water' | 'rent' | 'maintenance'>('items');

  // Item Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('جميع التصنيفات');
  const [selectedFamilyMember, setSelectedFamilyMember] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Load all app data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resMembers, resItems, resBills, resWater, resRent, resMaint] = await Promise.all([
        fetch('/api/family'),
        fetch('/api/items'),
        fetch('/api/bills'),
        fetch('/api/water'),
        fetch('/api/rent'),
        fetch('/api/maintenance')
      ]);

      if (resMembers.ok) setFamilyMembers(await resMembers.json());
      if (resItems.ok) setItems(await resItems.json());
      if (resBills.ok) setBills(await resBills.json());
      if (resWater.ok) setWaterRotation(await resWater.json());
      if (resRent.ok) setRentPayments(await resRent.json());
      if (resMaint.ok) setMaintenanceTasks(await resMaint.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute Overall Stats
  const stats: StatsOverview = useMemo(() => {
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.price || 0), 0);
    const activeWarranties = items.filter((i) => i.status === 'active').length;
    const expiringSoonWarranties = items.filter((i) => i.status === 'expiring_soon').length;
    const expiredWarranties = items.filter((i) => i.status === 'expired').length;
    const totalMonthlyBills = bills.reduce((sum, b) => sum + (b.amount || 0), 0);
    const unpaidBillsCount = bills.filter((b) => b.status !== 'paid').length;
    const dueMaintenanceCount = maintenanceTasks.filter((t) => t.status === 'overdue' || t.status === 'due_soon').length;

    return {
      totalItems,
      totalValue,
      activeWarranties,
      expiringSoonWarranties,
      expiredWarranties,
      totalMonthlyBills,
      unpaidBillsCount,
      dueMaintenanceCount
    };
  }, [items, bills, maintenanceTasks]);

  // Expiring items for alert banner
  const expiringItems = useMemo(() => {
    return items.filter((i) => i.status === 'expiring_soon');
  }, [items]);

  // Filtered Items for display
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchBrand = item.brand?.toLowerCase().includes(q);
        const matchModel = item.model?.toLowerCase().includes(q);
        const matchSerial = item.serial_number?.toLowerCase().includes(q);
        const matchStore = item.store_name.toLowerCase().includes(q);
        const matchPhone = item.store_phone?.toLowerCase().includes(q);
        const matchNotes = item.notes?.toLowerCase().includes(q);

        if (!matchName && !matchBrand && !matchModel && !matchSerial && !matchStore && !matchPhone && !matchNotes) {
          return false;
        }
      }

      if (selectedCategory !== 'جميع التصنيفات' && item.category !== selectedCategory) {
        return false;
      }

      if (selectedFamilyMember && item.purchased_by !== selectedFamilyMember) {
        return false;
      }

      if (statusFilter && item.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, selectedCategory, selectedFamilyMember, statusFilter]);

  // Items CRUD
  const handleSaveItem = async (itemData: Partial<Item>) => {
    if (editingItem) {
      const res = await fetch(`/api/items/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      if (!res.ok) throw new Error('Update failed');
    } else {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      if (!res.ok) throw new Error('Create failed');
    }
    fetchData();
  };

  const handleDeleteItem = async (id: number) => {
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      alert('فشل حذف المنتج');
    }
  };

  // Bills Updates
  const handleUpdateBill = async (billData: Partial<Bill>) => {
    const res = await fetch('/api/bills', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billData)
    });
    if (res.ok) {
      const updated = await res.json();
      setBills((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    }
  };

  const handleAddBill = async (billData: Partial<Bill>) => {
    const res = await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billData)
    });
    if (res.ok) {
      const created = await res.json();
      setBills((prev) => [...prev, created]);
    }
  };

  // Water Rotation Updates
  const handleUpdateWater = async (data: any) => {
    const res = await fetch('/api/water', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const updated = await res.json();
      setWaterRotation(updated);
    }
  };

  // Rent Payments Updates
  const handleUpdateRent = async (data: Partial<RentPayment>) => {
    const res = await fetch('/api/rent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const updated = await res.json();
      setRentPayments((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    }
  };

  // Maintenance Updates
  const handleUpdateMaintenance = async (data: any) => {
    const res = await fetch('/api/maintenance', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const updated = await res.json();
      setMaintenanceTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  };

  const handleAddMaintenance = async (data: any) => {
    const res = await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const created = await res.json();
      setMaintenanceTasks((prev) => [...prev, created]);
    }
  };

  const handleAddMember = async (name: string, color: string) => {
    const res = await fetch('/api/family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, avatar_color: color })
    });
    if (!res.ok) throw new Error('Failed to add family member');
    const newMember = await res.json();
    setFamilyMembers((prev) => [...prev, newMember]);
  };

  const handleExport = (format: 'csv' | 'json') => {
    window.location.href = `/api/export?format=${format}`;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] flex flex-col pb-20 md:pb-8">
      
      {/* Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFamilyMember={selectedFamilyMember}
        setSelectedFamilyMember={setSelectedFamilyMember}
        familyMembers={familyMembers}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingItem(null);
          setIsFormModalOpen(true);
        }}
        onOpenFamilyModal={() => setIsFamilyModalOpen(true)}
        onExport={handleExport}
        bills={bills}
        waterRotation={waterRotation}
        rentPayments={rentPayments}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Statistics Overview */}
        <StatCards
          stats={stats}
          activeStatusFilter={statusFilter}
          onFilterByStatus={(st) => {
            setActiveTab('items');
            setStatusFilter(st);
          }}
        />

        {/* Expiration Alert Banner */}
        <ExpirationAlertBanner
          expiringItems={expiringItems}
          onSelectItem={(item) => {
            setSelectedItem(item);
            setIsDetailModalOpen(true);
          }}
        />

        {/* Dynamic Tab Content */}
        {activeTab === 'bills' && (
          <div className="space-y-6">
            <BudgetAnalyticsSection bills={bills} rentPayments={rentPayments} />
            <BillsSection
              bills={bills}
              familyMembers={familyMembers}
              onUpdateBill={handleUpdateBill}
              onAddBill={handleAddBill}
            />
          </div>
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceSection
            tasks={maintenanceTasks}
            familyMembers={familyMembers}
            onUpdateTask={handleUpdateMaintenance}
            onAddTask={handleAddMaintenance}
          />
        )}

        {activeTab === 'water' && (
          <WaterRotationCard
            rotation={waterRotation}
            onUpdate={handleUpdateWater}
          />
        )}

        {activeTab === 'rent' && (
          <RentSection
            rentPayments={rentPayments}
            onUpdateRent={handleUpdateRent}
          />
        )}

        {activeTab === 'items' && (
          <div>
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-[#EBE5DA]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Section Title */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900">سجل المشتريات والضمانات</h2>
                <span className="text-xs text-stone-600 bg-stone-100 border border-stone-200 px-2.5 py-0.5 rounded-full font-bold">
                  {filteredItems.length} {filteredItems.length === 1 ? 'منتج' : 'منتجات'}
                </span>
              </div>

              {statusFilter && (
                <button
                  onClick={() => setStatusFilter('')}
                  className="text-xs text-amber-800 hover:underline font-bold cursor-pointer"
                >
                  إلغاء التصفية ({statusFilter})
                </button>
              )}
            </div>

            {/* Purchases Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white border border-[#EBE5DA] rounded-2xl h-52 animate-pulse" />
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    familyMembers={familyMembers}
                    onSelect={(selected) => {
                      setSelectedItem(selected);
                      setIsDetailModalOpen(true);
                    }}
                    onEdit={(itemToEdit) => {
                      setEditingItem(itemToEdit);
                      setIsFormModalOpen(true);
                    }}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#EBE5DA] rounded-2xl p-12 text-center max-w-lg mx-auto my-8">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-500">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900 mb-1">لا توجد مشتريات</h3>
                <p className="text-xs text-stone-500 mb-5 font-medium">
                  ابدأ بحفظ وتتبع مشتريات عائلتك، أرقام المتاجر وفترات الضمان بسهولة!
                </p>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsFormModalOpen(true);
                  }}
                  className="bg-amber-800 hover:bg-amber-900 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة أول شراء</span>
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#EBE5DA] bg-white py-4 text-center text-xs text-stone-500 font-medium">
        <p>بيت العائلة &bull; المشتريات، الضمانات، الفواتير، الصيانة، دورة المياه وإيجار الشقة</p>
      </footer>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unpaidBillsCount={stats.unpaidBillsCount}
        expiringWarrantiesCount={stats.expiringSoonWarranties}
      />

      {/* Modals */}
      <ItemFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
        familyMembers={familyMembers}
      />

      <ItemDetailModal
        isOpen={isDetailModalOpen}
        item={selectedItem}
        familyMembers={familyMembers}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedItem(null);
        }}
        onEdit={(itemToEdit) => {
          setIsDetailModalOpen(false);
          setSelectedItem(null);
          setEditingItem(itemToEdit);
          setIsFormModalOpen(true);
        }}
        onDelete={handleDeleteItem}
      />

      <FamilyMemberModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        familyMembers={familyMembers}
        onAddMember={handleAddMember}
      />

    </div>
  );
}
