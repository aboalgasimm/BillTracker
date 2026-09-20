import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { WaterRotation } from '@/types';

export async function GET() {
  try {
    const db = getDb();
    const rotation = db.prepare('SELECT * FROM water_rotation WHERE id = 1').get() as WaterRotation | undefined;
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

    const db = getDb();
    const existing = db.prepare('SELECT * FROM water_rotation WHERE id = 1').get() as WaterRotation;

    let newTurnCount = existing.current_turn_count;
    let newIsOurTurn = existing.is_our_turn ? 1 : 0;
    let lastPaid = existing.last_payment_date;

    if (action === 'increment_turn') {
      // Record a paid water bill
      newTurnCount = existing.current_turn_count + 1;
      lastPaid = new Date().toISOString().split('T')[0];

      // If we finished our 4 turns, pass turn to next apartment
      if (newTurnCount >= (total_turns_per_cycle || existing.total_turns_per_cycle)) {
        newIsOurTurn = 0; // Next apartment's turn
        newTurnCount = 0; // Reset count for next cycle
      }
    } else if (action === 'toggle_turn') {
      newIsOurTurn = newIsOurTurn === 1 ? 0 : 1;
      if (newIsOurTurn === 1 && newTurnCount === 0) {
        newTurnCount = 1; // Start payment 1 of 4
      }
    }

    const stmt = db.prepare(`
      UPDATE water_rotation SET
        total_turns_per_cycle = COALESCE(?, total_turns_per_cycle),
        current_turn_count = ?,
        is_our_turn = ?,
        assigned_to = COALESCE(?, assigned_to),
        last_payment_date = ?,
        notes = COALESCE(?, notes)
      WHERE id = 1
    `);

    stmt.run(
      total_turns_per_cycle ?? existing.total_turns_per_cycle,
      current_turn_count !== undefined ? current_turn_count : newTurnCount,
      is_our_turn !== undefined ? (is_our_turn ? 1 : 0) : newIsOurTurn,
      assigned_to || existing.assigned_to,
      lastPaid,
      notes !== undefined ? notes : existing.notes
    );

    const updated = db.prepare('SELECT * FROM water_rotation WHERE id = 1').get() as WaterRotation;
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating water rotation:', error);
    return NextResponse.json({ error: 'Failed to update water rotation' }, { status: 500 });
  }
}
