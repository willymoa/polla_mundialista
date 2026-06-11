"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  editarOrganizacionSchema,
  type EditarOrganizacionInput,
} from "@/lib/validations";
import { actualizarOrganizacionAction } from "@/app/org/[orgSlug]/configuracion/actions";

export function EditarOrganizacionForm({
  orgSlug,
  defaultValues,
}: {
  orgSlug: string;
  defaultValues: EditarOrganizacionInput;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditarOrganizacionInput>({
    resolver: zodResolver(editarOrganizacionSchema),
    defaultValues,
  });

  const onSubmit = (values: EditarOrganizacionInput) => {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await actualizarOrganizacionAction(orgSlug, values);
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
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("nombre")}
        />
        {errors.nombre && (
          <p className="text-sm text-red-600">{errors.nombre.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="logoUrl" className="text-sm font-medium text-brand-primary">
          URL del logo (opcional)
        </label>
        <input
          id="logoUrl"
          type="text"
          placeholder="https://..."
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("logoUrl")}
        />
        {errors.logoUrl && (
          <p className="text-sm text-red-600">{errors.logoUrl.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="brandColor" className="text-sm font-medium text-brand-primary">
          Color de marca (opcional)
        </label>
        <input
          id="brandColor"
          type="text"
          placeholder="#1a3a5c"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("brandColor")}
        />
        {errors.brandColor && (
          <p className="text-sm text-red-600">{errors.brandColor.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      {success && (
        <p className="text-sm text-brand-positive">Cambios guardados.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
