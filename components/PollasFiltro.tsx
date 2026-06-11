"use client";

import Link from "next/link";

const FILTROS = [
  { value: "", label: "Todas" },
  { value: "ACTIVA", label: "Activas" },
  { value: "OCULTA", label: "Ocultas" },
  { value: "INACTIVA", label: "Inactivas" },
  { value: "ARCHIVADA", label: "Archivadas" },
] as const;

export function PollasFiltro({
  orgSlug,
  activo,
}: {
  orgSlug: string;
  activo: string;
}) {
  const base = `/org/${orgSlug}/pollas`;

  return (
    <div className="flex flex-wrap gap-2">
      {FILTROS.map(({ value, label }) => {
        const href = value ? `${base}?estado=${value}` : base;
        const isActive = activo === value;
        return (
          <Link
            key={value || "todas"}
            href={href}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              isActive
                ? "bg-brand-primary text-white"
                : "bg-white text-brand-primary/70 hover:bg-brand-background"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
