import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Item } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    const db = getDb();
    const items = db.prepare('SELECT * FROM items ORDER BY id ASC').all() as Item[];

    if (format === 'json') {
      return new NextResponse(JSON.stringify(items, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="family_purchases_backup_${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    }

    // Default CSV format
    const headers = [
      'ID',
      'Item Name',
      'Category',
      'Brand',
      'Model',
      'Serial Number',
      'Purchase Date',
      'Price',
      'Currency',
      'Purchased By',
      'Store Name',
      'Store Phone',
      'Store Location',
      'Store Website',
      'Warranty Months',
      'Warranty Expiration',
      'Warranty Type',
      'Notes'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [
      headers.join(','),
      ...items.map((item) =>
        [
          item.id,
          escapeCsv(item.name),
          escapeCsv(item.category),
          escapeCsv(item.brand),
          escapeCsv(item.model),
          escapeCsv(item.serial_number),
          item.purchase_date,
          item.price,
          escapeCsv(item.currency),
          escapeCsv(item.purchased_by),
          escapeCsv(item.store_name),
          escapeCsv(item.store_phone),
          escapeCsv(item.store_location),
          escapeCsv(item.store_website),
          item.warranty_duration_months,
          item.warranty_expiration,
          escapeCsv(item.warranty_type),
          escapeCsv(item.notes)
        ].join(',')
      )
    ];

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="family_purchases_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
