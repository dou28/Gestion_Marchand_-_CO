import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createServerClient();
  const body = await req.json();
  const sheetId = body.sheetId as string;
  const patch = body.patch;

  if (!sheetId) return NextResponse.json({ error: 'missing sheetId' }, { status: 400 });
  const { data: s } = await supabase
    .from('company_sheets')
    .select('drive_file_id, company_id')
    .eq('id', sheetId)
    .single();
  if (!s) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const r = await fetch(process.env.SHEETS_WRITE_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileId: s.drive_file_id,
      writes: patch?.writes ?? [],
      idempotencyKey: patch?.idempotencyKey ?? crypto.randomUUID()
    })
  });

  if (!r.ok) return NextResponse.json({ error: 'write failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
