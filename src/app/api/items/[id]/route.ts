import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
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

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const db = getDb();
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(params.id) as Item | undefined;

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const { status, days_remaining } = computeWarrantyStatus(item.warranty_expiration);
    return NextResponse.json({ ...item, status, days_remaining });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await request.json();
    const {
      name,
      category,
      brand,
      model,
      serial_number,
      purchase_date,
      price = 0,
      currency = '$',
      purchased_by,
      store_name,
      store_phone,
      store_location,
      store_website,
      warranty_duration_months = 12,
      warranty_expiration,
      warranty_type = 'Manufacturer Warranty',
      notes,
      receipt_url
    } = body;

    const db = getDb();
    const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    let finalExpiration = warranty_expiration;
    if (!finalExpiration && purchase_date) {
      const pDate = new Date(purchase_date);
      pDate.setMonth(pDate.getMonth() + Number(warranty_duration_months));
      finalExpiration = pDate.toISOString().split('T')[0];
    }

    const stmt = db.prepare(`
      UPDATE items SET
        name = ?,
        category = ?,
        brand = ?,
        model = ?,
        serial_number = ?,
        purchase_date = ?,
        price = ?,
        currency = ?,
        purchased_by = ?,
        store_name = ?,
        store_phone = ?,
        store_location = ?,
        store_website = ?,
        warranty_duration_months = ?,
        warranty_expiration = ?,
        warranty_type = ?,
        notes = ?,
        receipt_url = ?
      WHERE id = ?
    `);

    stmt.run(
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
      receipt_url || null,
      params.id
    );

    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(params.id) as Item;
    const { status, days_remaining } = computeWarrantyStatus(updatedItem.warranty_expiration);

    return NextResponse.json({ ...updatedItem, status, days_remaining });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const db = getDb();
    const result = db.prepare('DELETE FROM items WHERE id = ?').run(params.id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
