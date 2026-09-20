import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { Item, WarrantyStatus } from '@/types';

function computeWarrantyStatus(expirationDateStr: string): { status: WarrantyStatus; days_remaining: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiration = new Date(expirationDateStr);
  expiration.setHours(0, 0, 0, 0);

  const diffTime = expiration.getTime() - today.getTime();
  const days_remaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: WarrantyStatus = 'active';
  if (days_remaining < 0) {
    status = 'expired';
  } else if (days_remaining <= 30) {
    status = 'expiring_soon';
  }

  return { status, days_remaining };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category') || '';
    const purchasedBy = searchParams.get('purchased_by') || '';
    const statusFilter = searchParams.get('status') || '';

    const rows = await query<Item>('SELECT * FROM items ORDER BY id DESC');

    const processedItems: Item[] = rows.map((item) => {
      const { status, days_remaining } = computeWarrantyStatus(item.warranty_expiration);
      return {
        ...item,
        status,
        days_remaining
      };
    });

    const filtered = processedItems.filter((item) => {
      if (q) {
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

      if (category && item.category !== category) {
        return false;
      }

      if (purchasedBy && item.purchased_by !== purchasedBy) {
        return false;
      }

      if (statusFilter && item.status !== statusFilter) {
        return false;
      }

      return true;
    });

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      brand,
      model,
      serial_number,
      purchase_date,
      price = 0,
      currency = 'ر.س',
      purchased_by,
      store_name,
      store_phone,
      store_location,
      store_website,
      warranty_duration_months = 12,
      warranty_expiration,
      warranty_type = 'ضمان الشركة المصنعة',
      notes,
      receipt_url
    } = body;

    if (!name || !category || !purchase_date || !purchased_by || !store_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let finalExpiration = warranty_expiration;
    if (!finalExpiration) {
      const pDate = new Date(purchase_date);
      pDate.setMonth(pDate.getMonth() + Number(warranty_duration_months));
      finalExpiration = pDate.toISOString().split('T')[0];
    }

    const result = await execute(
      `
      INSERT INTO items (
        name, category, brand, model, serial_number, purchase_date, price, currency,
        purchased_by, store_name, store_phone, store_location, store_website,
        warranty_duration_months, warranty_expiration, warranty_type, notes, receipt_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        name,
        category,
        brand || null,
        model || null,
        serial_number || null,
        purchase_date,
        Number(price),
        currency,
        purchased_by,
        store_name,
        store_phone || null,
        store_location || null,
        store_website || null,
        Number(warranty_duration_months),
        finalExpiration,
        warranty_type,
        notes || null,
        receipt_url || null
      ]
    );

    const newItem = await queryOne<Item>('SELECT * FROM items WHERE id = ?', [result.lastInsertRowid]);
    if (!newItem) {
      return NextResponse.json({ error: 'Failed to retrieve inserted item' }, { status: 500 });
    }

    const { status, days_remaining } = computeWarrantyStatus(newItem.warranty_expiration);
    return NextResponse.json({ ...newItem, status, days_remaining }, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
