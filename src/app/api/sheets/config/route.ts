import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const sheetId = searchParams.get('sheetId');
  if (!sheetId) return NextResponse.json({ error: 'missing' }, { status: 400 });

  const { data: cfg } = await supabase
    .from('sheet_configs')
    .select('config')
    .eq('sheet_id', sheetId)
    .single();

  return NextResponse.json(cfg?.config ?? {
    columns: [
      { key: "A", header: "Col A", type: "text", width: 160 },
      { key: "B", header: "Col B", type: "text", width: 200 }
    ],
    pagination: { pageSize: 50 }
  });
}
