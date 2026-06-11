"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { EstadoPartido } from "@prisma/client";
import { resultadoSchema, type ResultadoInput } from "@/lib/validations";
import { actualizarResultadoAction } from "@/app/org/[orgSlug]/pollas/[pollaSlug]/resultados/actions";

const ESTADO_LABEL: Record<EstadoPartido, string> = {
  PENDIENTE: "Pendiente",
  CERRADO: "Cerrado",
  FINALIZADO: "Finalizado",
};

export type PartidoResultado = {
  id: string;
  fechaHora: Date;
  fase: string | null;
  estado: EstadoPartido;
  golesLocalReal: number | null;
  golesVisitanteReal: number | null;
  equipoLocal: { nombre: string };
  equipoVisitante: { nombre: string };
};

export function ResultadosManager({
  orgSlug,
  pollaSlug,
  partidos,
}: {
  orgSlug: string;
  pollaSlug: string;
  partidos: PartidoResultado[];
}) {
  if (partidos.length === 0) {
    return <p className="text-sm text-brand-primary/70">Aún no hay partidos registrados.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {partidos.map((partido) => (
        <ResultadoFila key={partido.id} orgSlug={orgSlug} pollaSlug={pollaSlug} partido={partido} />
      ))}
    </div>
  );
}

function ResultadoFila({
  orgSlug,
  pollaSlug,
  partido,
}: {
  orgSlug: string;
  pollaSlug: string;
  partido: PartidoResultado;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
  } = useForm<ResultadoInput>({
    resolver: zodResolver(resultadoSchema),
    defaultValues: {
      golesLocalReal: partido.golesLocalReal ?? 0,
      golesVisitanteReal: partido.golesVisitanteReal ?? 0,
      estado: partido.estado,
    },
  });

  const onSubmit = (values: ResultadoInput) => {
    setServerError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await actualizarResultadoAction(orgSlug, pollaSlug, partido.id, values);
      if (result?.error) {
        setServerError(result.error);
      } else {
        setSaved(true);
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-brand-primary">
            {partido.equipoLocal.nombre} vs {partido.equipoVisitante.nombre}
          </p>
          <p className="text-sm text-brand-primary/70">
            {partido.fase ? `${partido.fase} · ` : ""}
            {new Date(partido.fechaHora).toLocaleString("es-CO")}
          </p>
        </div>
        <span className="rounded-full bg-brand-background px-3 py-1 text-xs font-semibold text-brand-primary">
          {ESTADO_LABEL[partido.estado]}
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-3 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-brand-primary">
            {partido.equipoLocal.nombre}
          </label>
          <input
            type="number"
            min={0}
            max={99}
            className="w-20 rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
            {...register("golesLocalReal", { valueAsNumber: true })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-brand-primary">
            {partido.equipoVisitante.nombre}
          </label>
          <input
            type="number"
            min={0}
            max={99}
            className="w-20 rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
            {...register("golesVisitanteReal", { valueAsNumber: true })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-brand-primary">Estado</label>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
            {...register("estado")}
          >
            <option value="PENDIENTE">Pendiente</option>
            <option value="CERRADO">Cerrado</option>
            <option value="FINALIZADO">Finalizado</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Guardando..." : "Guardar resultado"}
        </button>
      </form>
      {serverError && <p className="mt-1 text-sm text-red-600">{serverError}</p>}
      {saved && !serverError && (
        <p className="mt-1 text-sm text-brand-positive">
          Resultado guardado y puntos recalculados.
        </p>
      )}
    </div>
  );
}
