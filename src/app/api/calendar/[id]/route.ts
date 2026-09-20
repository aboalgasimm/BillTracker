import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Item } from '@/types';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const db = getDb();
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(params.id) as Item | undefined;

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const expDate = item.warranty_expiration.replace(/-/g, '');
    const createdDate = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HomeVault Family Tracker//Warranty Expiration//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:warranty-${item.id}-${item.warranty_expiration}@homevault.local`,
      `DTSTAMP:${createdDate}`,
      `DTSTART;VALUE=DATE:${expDate}`,
      `DTEND;VALUE=DATE:${expDate}`,
      `SUMMARY:⚠️ Warranty Expiring: ${item.name}`,
      `DESCRIPTION:Warranty is expiring today for ${item.name}.\\nBrand: ${item.brand || 'N/A'}\\nModel: ${item.model || 'N/A'}\\nSerial #: ${item.serial_number || 'N/A'}\\nStore: ${item.store_name} (${item.store_phone || 'No phone recorded'})\\nPurchased By: ${item.purchased_by}\\nNotes: ${item.notes || 'None'}`,
      `LOCATION:${item.store_location || item.store_name}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P7D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: Warranty for ${item.name} expires in 7 days!`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const filename = `warranty_${item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`;

    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Calendar generation error:', error);
    return NextResponse.json({ error: 'Failed to generate calendar event' }, { status: 500 });
  }
}
