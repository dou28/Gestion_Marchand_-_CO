import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function CompaniesPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: companies, error } = await supabase
    .from('companies').select('id,name').order('name');

  if (!companies || companies.length === 0) {
    return <div className="mt-16">Aucune entreprise. Demandez à un admin de vous inviter.</div>;
  }
  if (companies.length === 1) redirect(`/sheets?companyId=${companies[0].id}`);

  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
      {companies.map(c => (
        <a key={c.id} href={`/sheets?companyId=${c.id}`}
           className="rounded-2xl border p-5 hover:shadow">
          <div className="text-lg font-medium">{c.name}</div>
          <div className="text-sm text-gray-500">Accéder</div>
        </a>
      ))}
    </div>
  );
}
