import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { FamilyMember } from '@/types';

export async function GET() {
  try {
    const members = await query<FamilyMember>('SELECT * FROM family_members ORDER BY id ASC');
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

    const result = await execute('INSERT INTO family_members (name, avatar_color) VALUES (?, ?)', [name.trim(), avatar_color]);
    const newMember = await queryOne<FamilyMember>('SELECT * FROM family_members WHERE id = ?', [result.lastInsertRowid]);
    return NextResponse.json(newMember, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed') || error.message?.includes('unique constraint')) {
      return NextResponse.json({ error: 'Family member already exists' }, { status: 409 });
    }
    console.error('Error adding family member:', error);
    return NextResponse.json({ error: 'Failed to add family member' }, { status: 500 });
  }
}
