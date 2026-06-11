"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { TipoAcierto } from "@prisma/client";
import { pronosticoSchema, type PronosticoInput } from "@/lib/validations";
import { guardarPronosticoAction } from "@/app/org/[orgSlug]/pollas/[pollaSlug]/pronosticos/actions";

export type PartidoPronostico = {
  id: string;
  fechaHora: Date;
  fase: string | null;
  bloqueado: boolean;
  equipoLocal: { nombre: string };
  equipoVisitante: { nombre: string };
  golesLocalReal: number | null;
  golesVisitanteReal: number | null;
  pronostico: {
    golesLocal: number;
    golesVisitante: number;
    puntos: number;
    tipoAcierto: TipoAcierto;
  } | null;
};

export function PronosticosManager({
  orgSlug,
  pollaSlug,
  partidos,
  puedeEditar,
}: {
  orgSlug: string;
  pollaSlug: string;
  partidos: PartidoPronostico[];
  puedeEditar: boolean;
}) {
  if (partidos.length === 0) {
    return <p className="text-sm text-brand-primary/70">Aún no hay partidos programados.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {partidos.map((partido) => (
        <PronosticoFila
          key={partido.id}
          orgSlug={orgSlug}
          pollaSlug={pollaSlug}
          partido={partido}
          puedeEditar={puedeEditar}
        />
      ))}
    </div>
  );
}

function PronosticoFila({
  orgSlug,
  pollaSlug,
  partido,
  puedeEditar,
}: {
  orgSlug: string;
  pollaSlug: string;
  partido: PartidoPronostico;
  puedeEditar: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PronosticoInput>({
    resolver: zodResolver(pronosticoSchema),
    defaultValues: {
      golesLocal: partido.pronostico?.golesLocal ?? 0,
      golesVisitante: partido.pronostico?.golesVisitante ?? 0,
    },
  });

  const editable = puedeEditar && !partido.bloqueado;

  const onSubmit = (values: PronosticoInput) => {
    setServerError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await guardarPronosticoAction(orgSlug, pollaSlug, partido.id, values);
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
        {partido.golesLocalReal !== null && partido.golesVisitanteReal !== null && (
          <span className="rounded-full bg-brand-background px-3 py-1 text-sm font-semibold text-brand-primary">
            Resultado: {partido.golesLocalReal} - {partido.golesVisitanteReal}
          </span>
        )}
        {partido.bloqueado && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-brand-primary/70">
            Bloqueado
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-3 flex flex-wrap items-center gap-3"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-brand-primary">
            {partido.equipoLocal.nombre}
          </label>
          <input
            type="number"
            min={0}
            max={99}
            disabled={!editable}
            className="w-20 rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none disabled:bg-gray-100"
            {...register("golesLocal", { valueAsNumber: true })}
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
            disabled={!editable}
            className="w-20 rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none disabled:bg-gray-100"
            {...register("golesVisitante", { valueAsNumber: true })}
          />
        </div>
        {editable && (
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? "Guardando..." : "Guardar pronóstico"}
          </button>
        )}
        {partido.pronostico && partido.pronostico.tipoAcierto !== "NINGUNO" && (
          <span className="rounded-full bg-brand-positive/20 px-3 py-1 text-sm font-semibold text-brand-positive">
            +{partido.pronostico.puntos} pts
          </span>
        )}
      </form>
      {(errors.golesLocal || errors.golesVisitante) && (
        <p className="mt-1 text-sm text-red-600">
          {errors.golesLocal?.message ?? errors.golesVisitante?.message}
        </p>
      )}
      {serverError && <p className="mt-1 text-sm text-red-600">{serverError}</p>}
      {saved && !serverError && (
        <p className="mt-1 text-sm text-brand-positive">Pronóstico guardado.</p>
      )}
    </div>
  );
}
