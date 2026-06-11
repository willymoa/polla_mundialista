"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { crearPollaSchema, type CrearPollaInput } from "@/lib/validations";
import { crearPollaAction } from "@/app/org/[orgSlug]/pollas/nueva/actions";

export function CrearPollaForm({ orgSlug }: { orgSlug: string }) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CrearPollaInput>({
    resolver: zodResolver(crearPollaSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      torneo: "",
      lockMode: "PER_MATCH",
      esPublica: false,
    },
  });

  const onSubmit = (values: CrearPollaInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await crearPollaAction(orgSlug, values);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="nombre" className="text-sm font-medium text-brand-primary">
          Nombre de la polla
        </label>
        <input
          id="nombre"
          type="text"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("nombre")}
        />
        {errors.nombre && <p className="text-sm text-red-600">{errors.nombre.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="descripcion" className="text-sm font-medium text-brand-primary">
          Descripción (opcional)
        </label>
        <textarea
          id="descripcion"
          rows={3}
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("descripcion")}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="torneo" className="text-sm font-medium text-brand-primary">
          Torneo (opcional)
        </label>
        <input
          id="torneo"
          type="text"
          placeholder="Mundial 2026"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("torneo")}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="lockMode" className="text-sm font-medium text-brand-primary">
          Modo de bloqueo de pronósticos
        </label>
        <select
          id="lockMode"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("lockMode")}
        >
          <option value="PER_MATCH">Por partido (se bloquea al iniciar cada partido)</option>
          <option value="GLOBAL_DEADLINE">Fecha límite global</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-brand-primary">
        <input type="checkbox" className="h-4 w-4" {...register("esPublica")} />
        Permitir que cualquiera con el enlace vea la polla
      </label>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Creando..." : "Crear polla"}
      </button>
    </form>
  );
}
