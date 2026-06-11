"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  crearInvitacionSchema,
  type CrearInvitacionInput,
} from "@/lib/validations";
import { crearInvitacionAction } from "@/app/org/[orgSlug]/miembros/actions";

export function InviteMemberForm({ orgSlug }: { orgSlug: string }) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CrearInvitacionInput>({
    resolver: zodResolver(crearInvitacionSchema),
    defaultValues: { roleAsignado: "MIEMBRO", emailInvitado: "", diasExpiracion: 7 },
  });

  const onSubmit = (values: CrearInvitacionInput) => {
    setServerError(null);
    setCodigoGenerado(null);
    startTransition(async () => {
      const result = await crearInvitacionAction(orgSlug, values);
      if (result?.error) {
        setServerError(result.error);
      } else if (result?.codigo) {
        setCodigoGenerado(result.codigo);
        reset({ roleAsignado: values.roleAsignado, emailInvitado: "", diasExpiracion: values.diasExpiracion });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="roleAsignado" className="text-sm font-medium text-brand-primary">
          Rol asignado
        </label>
        <select
          id="roleAsignado"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("roleAsignado")}
        >
          <option value="MIEMBRO">Miembro</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="emailInvitado" className="text-sm font-medium text-brand-primary">
          Correo del invitado (opcional)
        </label>
        <input
          id="emailInvitado"
          type="email"
          placeholder="persona@correo.com"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("emailInvitado")}
        />
        {errors.emailInvitado && (
          <p className="text-sm text-red-600">{errors.emailInvitado.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="diasExpiracion" className="text-sm font-medium text-brand-primary">
          Días de validez
        </label>
        <input
          id="diasExpiracion"
          type="number"
          min={1}
          max={90}
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("diasExpiracion", { valueAsNumber: true })}
        />
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      {codigoGenerado && (
        <p className="rounded-lg bg-brand-background px-3 py-2 text-sm text-brand-primary">
          Código generado: <span className="font-mono font-bold">{codigoGenerado}</span>
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Generando..." : "Generar código de invitación"}
      </button>
    </form>
  );
}
