"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editarPollaSchema, type EditarPollaInput } from "@/lib/validations";
import { actualizarPollaAction } from "@/app/org/[orgSlug]/pollas/[pollaSlug]/configuracion/actions";

export function EditarPollaForm({
  orgSlug,
  pollaSlug,
  defaultValues,
}: {
  orgSlug: string;
  pollaSlug: string;
  defaultValues: EditarPollaInput;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditarPollaInput>({
    resolver: zodResolver(editarPollaSchema),
    defaultValues,
  });

  const onSubmit = (values: EditarPollaInput) => {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await actualizarPollaAction(orgSlug, pollaSlug, values);
      if (result?.error) {
        setServerError(result.error);
      } else {
        setSuccess(true);
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
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("torneo")}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="estado" className="text-sm font-medium text-brand-primary">
          Estado
        </label>
        <select
          id="estado"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("estado")}
        >
          <option value="BORRADOR">Borrador</option>
          <option value="ACTIVA">Activa</option>
          <option value="FINALIZADA">Finalizada</option>
          <option value="ARCHIVADA">Archivada</option>
          <option value="OCULTA">Oculta</option>
          <option value="INACTIVA">Inactiva</option>
        </select>
        <p className="text-xs text-brand-primary/60">
          <strong>Activa:</strong> funcionamiento normal.{" "}
          <strong>Oculta:</strong> solo la ven administradores de la organización.{" "}
          <strong>Inactiva:</strong> visible en lectura, sin pronósticos ni cambios.{" "}
          <strong>Archivada:</strong> polla cerrada históricamente.
        </p>
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
      {success && <p className="text-sm text-brand-positive">Cambios guardados.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
