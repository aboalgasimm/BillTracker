import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { RentPayment } from '@/types';

export async function GET() {
  try {
    const rent = await query<RentPayment>('SELECT * FROM rent_payments ORDER BY id ASC');
    return NextResponse.json(rent);
  } catch (error) {
    console.error('Error fetching rent payments:', error);
    return NextResponse.json({ error: 'Failed to fetch rent payments' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, paid_date, receipt_url, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing rent id' }, { status: 400 });
    }

    await execute(
      `
      UPDATE rent_payments SET
        status = COALESCE(?, status),
        paid_date = COALESCE(?, paid_date),
        receipt_url = COALESCE(?, receipt_url),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `,
      [status, paid_date, receipt_url, notes, id]
    );

    const updated = await queryOne<RentPayment>('SELECT * FROM rent_payments WHERE id = ?', [id]);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating rent payment:', error);
    return NextResponse.json({ error: 'Failed to update rent payment' }, { status: 500 });
  }
}
