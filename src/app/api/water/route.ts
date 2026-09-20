import { NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { WaterRotation } from '@/types';

export async function GET() {
  try {
    const rotation = await queryOne<WaterRotation>('SELECT * FROM water_rotation WHERE id = 1');
    return NextResponse.json(rotation);
  } catch (error) {
    console.error('Error fetching water rotation:', error);
    return NextResponse.json({ error: 'Failed to fetch water rotation' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action, total_turns_per_cycle, current_turn_count, is_our_turn, assigned_to, notes } = body;

    const existing = await queryOne<WaterRotation>('SELECT * FROM water_rotation WHERE id = 1');
    if (!existing) {
      return NextResponse.json({ error: 'Water rotation record not found' }, { status: 404 });
    }

    let newTurnCount = existing.current_turn_count;
    let newIsOurTurn = existing.is_our_turn ? 1 : 0;
    let lastPaid = existing.last_payment_date;

    if (action === 'increment_turn') {
      newTurnCount = existing.current_turn_count + 1;
      lastPaid = new Date().toISOString().split('T')[0];

      if (newTurnCount >= (total_turns_per_cycle || existing.total_turns_per_cycle)) {
        newIsOurTurn = 0;
        newTurnCount = 0;
      }
    } else if (action === 'toggle_turn') {
      newIsOurTurn = newIsOurTurn === 1 ? 0 : 1;
      if (newIsOurTurn === 1 && newTurnCount === 0) {
        newTurnCount = 1;
      }
    }

    await execute(
      `
      UPDATE water_rotation SET
        total_turns_per_cycle = COALESCE(?, total_turns_per_cycle),
        current_turn_count = ?,
        is_our_turn = ?,
        assigned_to = COALESCE(?, assigned_to),
        last_payment_date = ?,
        notes = COALESCE(?, notes)
      WHERE id = 1
    `,
      [
        total_turns_per_cycle ?? existing.total_turns_per_cycle,
        current_turn_count !== undefined ? current_turn_count : newTurnCount,
        is_our_turn !== undefined ? (is_our_turn ? 1 : 0) : newIsOurTurn,
        assigned_to || existing.assigned_to,
        lastPaid,
        notes !== undefined ? notes : existing.notes
      ]
    );

    const updated = await queryOne<WaterRotation>('SELECT * FROM water_rotation WHERE id = 1');
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating water rotation:', error);
    return NextResponse.json({ error: 'Failed to update water rotation' }, { status: 500 });
  }
}
