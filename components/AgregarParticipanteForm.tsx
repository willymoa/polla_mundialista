"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  agregarParticipanteSchema,
  type AgregarParticipanteInput,
} from "@/lib/validations";
import { agregarParticipanteAction } from "@/app/org/[orgSlug]/pollas/[pollaSlug]/configuracion/actions";

export type MiembroDisponible = {
  userId: string;
  nombre: string;
  email: string;
};

export function AgregarParticipanteForm({
  orgSlug,
  pollaSlug,
  miembrosDisponibles,
}: {
  orgSlug: string;
  pollaSlug: string;
  miembrosDisponibles: MiembroDisponible[];
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AgregarParticipanteInput>({
    resolver: zodResolver(agregarParticipanteSchema),
    defaultValues: { userId: "", role: "PARTICIPANTE" },
  });

  if (miembrosDisponibles.length === 0) {
    return (
      <p className="text-sm text-brand-primary/70">
        Todos los miembros de la organización ya son participantes de esta polla.
      </p>
    );
  }

  const onSubmit = (values: AgregarParticipanteInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await agregarParticipanteAction(orgSlug, pollaSlug, values);
      if (result?.error) {
        setServerError(result.error);
      } else {
        reset({ userId: "", role: "PARTICIPANTE" });
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="userId" className="text-sm font-medium text-brand-primary">
          Miembro de la organización
        </label>
        <select
          id="userId"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("userId")}
        >
          <option value="">Selecciona un miembro</option>
          {miembrosDisponibles.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.nombre} ({m.email})
            </option>
          ))}
        </select>
        {errors.userId && <p className="text-sm text-red-600">{errors.userId.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="role" className="text-sm font-medium text-brand-primary">
          Rol
        </label>
        <select
          id="role"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("role")}
        >
          <option value="ADMIN_POLLA">Admin de polla</option>
          <option value="PARTICIPANTE">Participante</option>
          <option value="ESPECTADOR">Espectador</option>
        </select>
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Agregando..." : "Agregar"}
      </button>
    </form>
  );
}
