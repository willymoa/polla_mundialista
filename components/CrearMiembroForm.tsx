"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  crearUsuarioOrgSchema,
  type CrearUsuarioOrgInput,
} from "@/lib/validations";
import { crearUsuarioOrgAction } from "@/app/org/[orgSlug]/miembros/actions";

export function CrearMiembroForm({
  orgSlug,
  esOwner,
}: {
  orgSlug: string;
  esOwner: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CrearUsuarioOrgInput>({
    resolver: zodResolver(crearUsuarioOrgSchema),
    defaultValues: { role: "MIEMBRO" },
  });

  const onSubmit = (values: CrearUsuarioOrgInput) => {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await crearUsuarioOrgAction(orgSlug, values);
      if (result?.error) {
        setServerError(result.error);
      } else {
        setSuccess(true);
        reset({ nombre: "", email: "", password: "", role: "MIEMBRO" });
        router.refresh();
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

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-brand-primary">
          Contraseña inicial
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
        <p className="text-xs text-brand-primary/60">
          Mínimo 8 caracteres. Comunícasela al usuario para su primer ingreso.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="role" className="text-sm font-medium text-brand-primary">
          Rol en la organización
        </label>
        <select
          id="role"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("role")}
        >
          <option value="MIEMBRO">Miembro</option>
          {esOwner && <option value="ADMIN">Administrador</option>}
        </select>
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      {success && (
        <p className="text-sm text-brand-positive">
          Usuario creado e inscrito en la organización.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Creando..." : "Crear usuario"}
      </button>
    </form>
  );
}
