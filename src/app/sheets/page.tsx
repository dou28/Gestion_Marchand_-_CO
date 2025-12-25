import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SheetsPage({ searchParams }: { searchParams: { companyId?: string }}) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const companyId = searchParams.companyId;
  if (!companyId) redirect('/companies');

  const { data: sheets } = await supabase
    .from('company_sheets')
    .select('id,sheet_name')
    .eq('company_id', companyId)
    .order('sheet_name');

  if (!sheets || sheets.length === 0) {
    return <div className="mt-16">Aucun Google Sheet pour cette entreprise.</div>;
  }
  if (sheets.length === 1) redirect(`/work/${sheets[0].id}`);

  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
      {sheets.map(s => (
        <a key={s.id} href={`/work/${s.id}`} className="rounded-2xl border p-5 hover:shadow">
          <div className="text-lg font-medium">{s.sheet_name}</div>
          <div className="text-sm text-gray-500">Ouvrir</div>
        </a>
      ))}
    </div>
  );
}
