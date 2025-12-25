'use client';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/DataTable';

type Row = Record<string, any>;
export default function WorkPage({ params }: { params: { sheetId: string }}) {
  const { sheetId } = params;
  const [rows, setRows] = useState<Row[]>([]);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const cfg = await fetch(`/api/sheets/config?sheetId=${sheetId}`).then(r=>r.json());
      setConfig(cfg);
      const data = await fetch(`/api/sheets/read?sheetId=${sheetId}`).then(r=>r.json());
      setRows(data.rows || []);
    })();
  }, [sheetId]);

  const onEdit = async (patch: any) => {
    const prev = structuredClone(rows);
    // optimistic update (very minimal example)
    setRows(patch.apply(rows));
    const res = await fetch(`/api/sheets/write`, { method: 'POST', body: JSON.stringify({ sheetId, patch }) });
    if (!res.ok) setRows(prev);
  };

  return (
    <div className="mt-6">
      <h1 className="text-xl font-semibold mb-4">Feuille</h1>
      <DataTable rows={rows} config={config} onEdit={onEdit} />
    </div>
  );
}
