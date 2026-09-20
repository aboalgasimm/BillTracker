import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Bill } from '@/types';

export async function GET() {
  try {
    const db = getDb();
    const bills = db.prepare('SELECT * FROM bills ORDER BY due_day ASC').all() as Bill[];
    return NextResponse.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, amount = 0, currency = 'ر.س', due_day = 1, status = 'unpaid', assigned_to, notes } = body;

    if (!title || !category || !assigned_to) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO bills (title, category, amount, currency, due_day, status, assigned_to, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(title, category, Number(amount), currency, Number(due_day), status, assigned_to, notes || null);
    const newBill = db.prepare('SELECT * FROM bills WHERE id = ?').get(result.lastInsertRowid) as Bill;

    return NextResponse.json(newBill, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, category, amount, due_day, status, assigned_to, notes, last_paid_date } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing bill id' }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare(`
      UPDATE bills SET
        title = COALESCE(?, title),
        category = COALESCE(?, category),
        amount = COALESCE(?, amount),
        due_day = COALESCE(?, due_day),
        status = COALESCE(?, status),
        assigned_to = COALESCE(?, assigned_to),
        notes = COALESCE(?, notes),
        last_paid_date = COALESCE(?, last_paid_date)
      WHERE id = ?
    `);

    stmt.run(title, category, amount, due_day, status, assigned_to, notes, last_paid_date, id);
    const updated = db.prepare('SELECT * FROM bills WHERE id = ?').get(id) as Bill;

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 });
  }
}
