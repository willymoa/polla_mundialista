"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type BarDatum = { name: string; valor: number };

export function SimpleBarChart({
  data,
  valueLabel,
  color = "#1a3a5c",
}: {
  data: BarDatum[];
  valueLabel: string;
  color?: string;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-brand-primary/70">No hay datos suficientes para mostrar la gráfica.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => [value, valueLabel]} />
        <Bar dataKey="valor" name={valueLabel} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
