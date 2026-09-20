import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { FamilyMember } from '@/types';

export async function GET() {
  try {
    const db = getDb();
    const members = db.prepare('SELECT * FROM family_members ORDER BY id ASC').all() as FamilyMember[];
    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching family members:', error);
    return NextResponse.json({ error: 'Failed to fetch family members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, avatar_color = '#3B82F6' } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare('INSERT INTO family_members (name, avatar_color) VALUES (?, ?)');
    const result = stmt.run(name.trim(), avatar_color);

    const newMember = db.prepare('SELECT * FROM family_members WHERE id = ?').get(result.lastInsertRowid) as FamilyMember;
    return NextResponse.json(newMember, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Family member already exists' }, { status: 409 });
    }
    console.error('Error adding family member:', error);
    return NextResponse.json({ error: 'Failed to add family member' }, { status: 500 });
  }
}
