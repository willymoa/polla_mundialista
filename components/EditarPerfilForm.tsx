"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actualizarPerfilSchema, type ActualizarPerfilInput } from "@/lib/validations";
import { actualizarPerfilAction } from "@/app/dashboard/cuenta/actions";

export function EditarPerfilForm({
  defaultValues,
}: {
  defaultValues: ActualizarPerfilInput;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActualizarPerfilInput>({
    resolver: zodResolver(actualizarPerfilSchema),
    defaultValues,
  });

  const onSubmit = (values: ActualizarPerfilInput) => {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await actualizarPerfilAction(values);
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
          autoComplete="name"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("nombre")}
        />
        {errors.nombre && (
          <p className="text-sm text-red-600">{errors.nombre.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-brand-primary">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      {success && <p className="text-sm text-brand-positive">Perfil actualizado.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Guardar perfil"}
      </button>
    </form>
  );
}
