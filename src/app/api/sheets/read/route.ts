import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const sheetId = searchParams.get('sheetId');

  if (!sheetId) return NextResponse.json({ error: 'missing sheetId' }, { status: 400 });
  const { data: s } = await supabase
    .from('company_sheets')
    .select('drive_file_id, range, company_id')
    .eq('id', sheetId)
    .single();

  if (!s) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const r = await fetch(process.env.SHEETS_READ_URL!, {
    headers: { 'x-file-id': s.drive_file_id, 'x-range': s.range || 'A:Z' }
  });
  const j = await r.json();
  return NextResponse.json({ rows: j.values || j.rows || [] });
}
