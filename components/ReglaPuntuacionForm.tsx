"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reglaPuntuacionSchema, type ReglaPuntuacionFormInput } from "@/lib/validations";
import { actualizarReglaPuntuacionAction } from "@/app/org/[orgSlug]/pollas/[pollaSlug]/configuracion/actions";

const setNumeroONulo = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

export function ReglaPuntuacionForm({
  orgSlug,
  pollaSlug,
  defaultValues,
}: {
  orgSlug: string;
  pollaSlug: string;
  defaultValues: ReglaPuntuacionFormInput;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReglaPuntuacionFormInput>({
    resolver: zodResolver(reglaPuntuacionSchema),
    defaultValues,
  });

  const onSubmit = (values: ReglaPuntuacionFormInput) => {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await actualizarReglaPuntuacionAction(orgSlug, pollaSlug, values);
      if (result?.error) {
        setServerError(result.error);
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-brand-primary">Marcador exacto</label>
          <input
            type="number"
            min={0}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
            {...register("puntosMarcadorExacto", { valueAsNumber: true })}
          />
          {errors.puntosMarcadorExacto && (
            <p className="text-sm text-red-600">{errors.puntosMarcadorExacto.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-brand-primary">Acertar resultado</label>
          <input
            type="number"
            min={0}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
            {...register("puntosResultado", { valueAsNumber: true })}
          />
          {errors.puntosResultado && (
            <p className="text-sm text-red-600">{errors.puntosResultado.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-brand-primary">Bonus por diferencia</label>
          <input
            type="number"
            min={0}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
            {...register("puntosBonusDiferencia", { valueAsNumber: true })}
          />
          {errors.puntosBonusDiferencia && (
            <p className="text-sm text-red-600">{errors.puntosBonusDiferencia.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-brand-primary">Campeón (opcional)</label>
          <input
            type="number"
            min={0}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
            {...register("puntosCampeon", { setValueAs: setNumeroONulo })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-brand-primary">Finalista (opcional)</label>
          <input
            type="number"
            min={0}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
            {...register("puntosFinalista", { setValueAs: setNumeroONulo })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-brand-primary">Goleador (opcional)</label>
          <input
            type="number"
            min={0}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
            {...register("puntosGoleador", { setValueAs: setNumeroONulo })}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-brand-primary">
        <input type="checkbox" className="h-4 w-4" {...register("permiteEditarHastaInicio")} />
        Permitir editar pronósticos hasta el inicio del partido
      </label>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      {success && (
        <p className="text-sm text-brand-positive">
          Reglas guardadas. Los puntos de los partidos finalizados fueron recalculados.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Guardar reglas de puntuación"}
      </button>
    </form>
  );
}
