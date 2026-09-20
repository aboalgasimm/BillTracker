export interface FamilyMember {
  id: number;
  name: string;
  avatar_color: string;
  created_at?: string;
}

export type WarrantyStatus = 'active' | 'expiring_soon' | 'expired';

export interface Item {
  id: number;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchase_date: string;
  price: number;
  currency: string;
  purchased_by: string;
  store_name: string;
  store_phone?: string;
  store_location?: string;
  store_website?: string;
  warranty_duration_months: number;
  warranty_expiration: string;
  warranty_type: string;
  notes?: string;
  receipt_url?: string;
  created_at?: string;
  status?: WarrantyStatus;
  days_remaining?: number;
}

export type BillStatus = 'paid' | 'unpaid' | 'due_soon';

export interface Bill {
  id: number;
  title: string;
  category: string; // 'electricity' | 'wifi' | 'car_insurance' | 'car_payment' | 'other'
  amount: number;
  currency: string;
  due_day: number;
  status: BillStatus;
  assigned_to: string;
  notes?: string;
  last_paid_date?: string;
}

export interface WaterRotation {
  id: number;
  building_name: string;
  total_turns_per_cycle: number;
  current_turn_count: number;
  is_our_turn: boolean;
  assigned_to: string;
  last_payment_date?: string;
  notes?: string;
}

export interface RentPayment {
  id: number;
  title: string;
  due_month: 'june' | 'december';
  due_date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'unpaid';
  paid_date?: string;
  receipt_url?: string;
  notes?: string;
}

export type MaintenanceStatus = 'active' | 'due_soon' | 'overdue';

export interface MaintenanceTask {
  id: number;
  title: string;
  category: string; // 'car' | 'appliance' | 'home' | 'other'
  item_name?: string;
  frequency_months: number;
  last_service_date: string;
  next_service_date: string;
  cost: number;
  currency: string;
  assigned_to: string;
  notes?: string;
  status?: MaintenanceStatus;
  days_remaining?: number;
}

export interface StatsOverview {
  totalItems: number;
  totalValue: number;
  activeWarranties: number;
  expiringSoonWarranties: number;
  expiredWarranties: number;
  totalMonthlyBills: number;
  unpaidBillsCount: number;
  dueMaintenanceCount: number;
}
