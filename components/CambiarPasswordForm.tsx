"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cambiarPasswordSchema, type CambiarPasswordInput } from "@/lib/validations";
import { cambiarPasswordAction } from "@/app/dashboard/cuenta/actions";

export function CambiarPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CambiarPasswordInput>({
    resolver: zodResolver(cambiarPasswordSchema),
  });

  const onSubmit = (values: CambiarPasswordInput) => {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await cambiarPasswordAction(values);
      if (result?.error) {
        setServerError(result.error);
      } else {
        setSuccess(true);
        reset();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="passwordActual" className="text-sm font-medium text-brand-primary">
          Contraseña actual
        </label>
        <input
          id="passwordActual"
          type="password"
          autoComplete="current-password"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("passwordActual")}
        />
        {errors.passwordActual && (
          <p className="text-sm text-red-600">{errors.passwordActual.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="passwordNueva" className="text-sm font-medium text-brand-primary">
          Nueva contraseña
        </label>
        <input
          id="passwordNueva"
          type="password"
          autoComplete="new-password"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("passwordNueva")}
        />
        {errors.passwordNueva && (
          <p className="text-sm text-red-600">{errors.passwordNueva.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="confirmacion" className="text-sm font-medium text-brand-primary">
          Confirmar nueva contraseña
        </label>
        <input
          id="confirmacion"
          type="password"
          autoComplete="new-password"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("confirmacion")}
        />
        {errors.confirmacion && (
          <p className="text-sm text-red-600">{errors.confirmacion.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      {success && (
        <p className="text-sm text-brand-positive">Contraseña actualizada correctamente.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Actualizando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}
