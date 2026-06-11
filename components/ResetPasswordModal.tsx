"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordAdminSchema, type ResetPasswordAdminInput } from "@/lib/validations";
import { resetPasswordAdminAction } from "@/app/org/[orgSlug]/miembros/actions";

export function ResetPasswordModal({
  orgSlug,
  userId,
  nombreUsuario,
  onClose,
}: {
  orgSlug: string;
  userId: string;
  nombreUsuario: string;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordAdminInput>({
    resolver: zodResolver(resetPasswordAdminSchema),
    defaultValues: { userId, passwordNueva: "", confirmacion: "" },
  });

  const onSubmit = (values: ResetPasswordAdminInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await resetPasswordAdminAction(orgSlug, values);
      if (result?.error) {
        setServerError(result.error);
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-brand-primary">
          Restablecer contraseña
        </h3>
        <p className="mt-1 text-sm text-brand-primary/70">
          Asigna una nueva contraseña para <strong>{nombreUsuario}</strong>.
        </p>

        {success ? (
          <div className="mt-4">
            <p className="text-sm text-brand-positive">
              Contraseña actualizada. Comunica la nueva contraseña al usuario.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-lg border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-3">
            <input type="hidden" {...register("userId")} />

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
                Confirmar contraseña
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

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isPending ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-brand-primary"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
