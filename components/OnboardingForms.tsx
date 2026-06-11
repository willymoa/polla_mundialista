"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  crearOrganizacionSchema,
  unirseCodigoSchema,
  type CrearOrganizacionInput,
  type UnirseCodigoInput,
} from "@/lib/validations";
import {
  crearOrganizacionAction,
  unirseConCodigoAction,
} from "@/app/onboarding/actions";

export function CrearOrganizacionForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CrearOrganizacionInput>({
    resolver: zodResolver(crearOrganizacionSchema),
  });

  const onSubmit = (values: CrearOrganizacionInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await crearOrganizacionAction(values);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="nombre" className="text-sm font-medium text-brand-primary">
          Nombre de la organización
        </label>
        <input
          id="nombre"
          type="text"
          placeholder="Ej. Empresa Acme"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("nombre")}
        />
        {errors.nombre && (
          <p className="text-sm text-red-600">{errors.nombre.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Creando..." : "Crear organización"}
      </button>
    </form>
  );
}

export function UnirseConCodigoForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UnirseCodigoInput>({
    resolver: zodResolver(unirseCodigoSchema),
  });

  const onSubmit = (values: UnirseCodigoInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await unirseConCodigoAction(values);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="codigo" className="text-sm font-medium text-brand-primary">
          Código de invitación
        </label>
        <input
          id="codigo"
          type="text"
          placeholder="Ej. ABC123"
          className="rounded-lg border border-gray-300 px-3 py-2 uppercase focus:border-brand-primary focus:outline-none"
          {...register("codigo")}
        />
        {errors.codigo && (
          <p className="text-sm text-red-600">{errors.codigo.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-brand-primary px-4 py-2 font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white disabled:opacity-60"
      >
        {isPending ? "Uniéndote..." : "Unirme a la organización"}
      </button>
    </form>
  );
}
