import { NextResponse } from 'next/server';
import { getDbUrl, initNeonDb, query } from '@/lib/db';

export async function GET() {
  try {
    const dbUrl = getDbUrl();

    if (!dbUrl) {
      return NextResponse.json(
        {
          success: false,
          dbUrlFound: false,
          message: '❌ لم يتم العثور على DATABASE_URL في متغيّرات بيئة Netlify.',
          instructions: 'يرجى الذهاب إلى Netlify -> Environment variables -> إضافة DATABASE_URL ثم اضغط Deploys -> Trigger deploy.'
        },
        { status: 400 }
      );
    }

    // Force initialize Neon tables
    await initNeonDb();

    // Verify by reading tables
    const members = await query('SELECT * FROM family_members ORDER BY id ASC');
    const items = await query('SELECT * FROM items ORDER BY id ASC');

    return NextResponse.json({
      success: true,
      dbUrlFound: true,
      message: '✅ تم الاتصال بقاعدة بيانات Neon السحابية وتأسيس الجداول بنجاح!',
      stats: {
        familyMembersCount: members.length,
        itemsCount: items.length
      }
    });
  } catch (error: any) {
    console.error('Setup endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown database initialization error'
      },
      { status: 500 }
    );
  }
}
