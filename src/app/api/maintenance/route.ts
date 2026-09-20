import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
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
    const rows = await query<MaintenanceTask>('SELECT * FROM maintenance ORDER BY next_service_date ASC');

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

    const lDate = new Date(last_service_date);
    lDate.setMonth(lDate.getMonth() + Number(frequency_months));
    const next_service_date = lDate.toISOString().split('T')[0];

    const result = await execute(
      `
      INSERT INTO maintenance (
        title, category, item_name, frequency_months, last_service_date, next_service_date,
        cost, currency, assigned_to, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
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
      ]
    );

    const newTask = await queryOne<MaintenanceTask>('SELECT * FROM maintenance WHERE id = ?', [result.lastInsertRowid]);
    if (!newTask) {
      return NextResponse.json({ error: 'Failed to retrieve inserted task' }, { status: 500 });
    }

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

    const existing = await queryOne<MaintenanceTask>('SELECT * FROM maintenance WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    let newLastDate = last_service_date || existing.last_service_date;
    let newFreq = frequency_months !== undefined ? Number(frequency_months) : existing.frequency_months;

    if (action === 'complete_service') {
      newLastDate = new Date().toISOString().split('T')[0];
    }

    const lDate = new Date(newLastDate);
    lDate.setMonth(lDate.getMonth() + Number(newFreq));
    const next_service_date = lDate.toISOString().split('T')[0];

    await execute(
      `
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
    `,
      [title, category, item_name, newFreq, newLastDate, next_service_date, cost, assigned_to, notes, id]
    );

    const updated = await queryOne<MaintenanceTask>('SELECT * FROM maintenance WHERE id = ?', [id]);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to retrieve updated task' }, { status: 500 });
    }

    const { status, days_remaining } = computeMaintenanceStatus(updated.next_service_date);
    return NextResponse.json({ ...updated, status, days_remaining });
  } catch (error) {
    console.error('Error updating maintenance:', error);
    return NextResponse.json({ error: 'Failed to update maintenance task' }, { status: 500 });
  }
}
