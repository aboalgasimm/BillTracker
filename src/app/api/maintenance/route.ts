import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { MaintenanceTask, MaintenanceStatus } from '@/types';

function computeMaintenanceStatus(nextServiceDateStr: string): { status: MaintenanceStatus; days_remaining: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextDate = new Date(nextServiceDateStr);
  nextDate.setHours(0, 0, 0, 0);

  const diffTime = nextDate.getTime() - today.getTime();
  const days_remaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: MaintenanceStatus = 'active';
  if (days_remaining < 0) {
    status = 'overdue';
  } else if (days_remaining <= 20) {
    status = 'due_soon';
  }

  return { status, days_remaining };
}

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM maintenance ORDER BY next_service_date ASC').all() as MaintenanceTask[];

    const processed: MaintenanceTask[] = rows.map((task) => {
      const { status, days_remaining } = computeMaintenanceStatus(task.next_service_date);
      return {
        ...task,
        status,
        days_remaining
      };
    });

    return NextResponse.json(processed);
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      category = 'other',
      item_name,
      frequency_months = 6,
      last_service_date,
      cost = 0,
      currency = 'ر.س',
      assigned_to,
      notes
    } = body;

    if (!title || !last_service_date || !assigned_to) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Auto calculate next service date
    const lDate = new Date(last_service_date);
    lDate.setMonth(lDate.getMonth() + Number(frequency_months));
    const next_service_date = lDate.toISOString().split('T')[0];

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO maintenance (
        title, category, item_name, frequency_months, last_service_date, next_service_date,
        cost, currency, assigned_to, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      category,
      item_name || null,
      Number(frequency_months),
      last_service_date,
      next_service_date,
      Number(cost),
      currency,
      assigned_to,
      notes || null
    );

    const newTask = db.prepare('SELECT * FROM maintenance WHERE id = ?').get(result.lastInsertRowid) as MaintenanceTask;
    const { status, days_remaining } = computeMaintenanceStatus(newTask.next_service_date);

    return NextResponse.json({ ...newTask, status, days_remaining }, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance:', error);
    return NextResponse.json({ error: 'Failed to create maintenance task' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, category, item_name, frequency_months, last_service_date, cost, assigned_to, notes, action } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing task id' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM maintenance WHERE id = ?').get(id) as MaintenanceTask;
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    let newLastDate = last_service_date || existing.last_service_date;
    let newFreq = frequency_months !== undefined ? Number(frequency_months) : existing.frequency_months;

    // If user clicked "Complete Service Today"
    if (action === 'complete_service') {
      newLastDate = new Date().toISOString().split('T')[0];
    }

    const lDate = new Date(newLastDate);
    lDate.setMonth(lDate.getMonth() + Number(newFreq));
    const next_service_date = lDate.toISOString().split('T')[0];

    const stmt = db.prepare(`
      UPDATE maintenance SET
        title = COALESCE(?, title),
        category = COALESCE(?, category),
        item_name = COALESCE(?, item_name),
        frequency_months = ?,
        last_service_date = ?,
        next_service_date = ?,
        cost = COALESCE(?, cost),
        assigned_to = COALESCE(?, assigned_to),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `);

    stmt.run(title, category, item_name, newFreq, newLastDate, next_service_date, cost, assigned_to, notes, id);
    const updated = db.prepare('SELECT * FROM maintenance WHERE id = ?').get(id) as MaintenanceTask;
    const { status, days_remaining } = computeMaintenanceStatus(updated.next_service_date);

    return NextResponse.json({ ...updated, status, days_remaining });
  } catch (error) {
    console.error('Error updating maintenance:', error);
    return NextResponse.json({ error: 'Failed to update maintenance task' }, { status: 500 });
  }
}
