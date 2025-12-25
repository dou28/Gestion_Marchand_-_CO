'use client';
import React from 'react';

type Config = { columns: { key: string; header: string; width?: number }[] };
export function DataTable({ rows, config, onEdit }:{ rows:any[]; config:Config; onEdit:(p:any)=>void }) {
  const cols = config?.columns ?? Object.keys(rows[0] ?? {}).map((k:string)=>({ key:k, header:k }));
  return (
    <div className="overflow-auto border rounded-2xl">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c.key} className="text-left px-3 py-2 border-b" style={{ width: c.width }}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="odd:bg-gray-50">
              {cols.map(c => (
                <td key={c.key} className="px-3 py-2 border-b">{String(r[c.key] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
