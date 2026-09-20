import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 });
    }

    // Convert file to Base64 Data URL (bypasses read-only serverless disk restrictions on Netlify)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';
    const base64String = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64String}`;

    return NextResponse.json({ url: dataUrl });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: error.message || 'فشل رفع الملف' }, { status: 500 });
  }
}
