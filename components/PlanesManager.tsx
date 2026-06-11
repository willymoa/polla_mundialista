"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { editarPlanSchema, type EditarPlanInput } from "@/lib/validations";
import { editarPlanAction } from "@/app/admin-platform/actions";

export type PlanRow = {
  id: string;
  nombre: string;
  maxPollas: number;
  maxParticipantesPorPolla: number;
  permiteLogo: boolean;
  permiteExportarExcel: boolean;
  permiteMultiplesAdmins: boolean;
};

function planToFormValues(plan: PlanRow): EditarPlanInput {
  return {
    nombre: plan.nombre,
    maxPollas: plan.maxPollas,
    maxParticipantesPorPolla: plan.maxParticipantesPorPolla,
    permiteLogo: plan.permiteLogo,
    permiteExportarExcel: plan.permiteExportarExcel,
    permiteMultiplesAdmins: plan.permiteMultiplesAdmins,
  };
}

export function PlanesManager({ planes }: { planes: PlanRow[] }) {
  if (planes.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-brand-primary/70">
          No hay planes configurados. Ejecuta{" "}
          <code className="rounded bg-brand-background px-1">pnpm exec prisma db seed</code>{" "}
          para cargar los planes por defecto (GRATIS, BÁSICO, PRO, EMPRESA).
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {planes.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}

function PlanCard({ plan }: { plan: PlanRow }) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditarPlanInput>({
    resolver: zodResolver(editarPlanSchema),
    values: planToFormValues(plan),
  });

  const onSubmit = (values: EditarPlanInput) => {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await editarPlanAction(plan.id, values);
      if (result?.error) {
        setServerError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-brand-primary">{plan.nombre}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-brand-primary">Nombre</label>
          <input
            type="text"
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
            {...register("nombre")}
          />
          {errors.nombre && <p className="text-sm text-red-600">{errors.nombre.message}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-brand-primary">Máx. pollas</label>
          <input
            type="number"
            min={0}
            className="w-28 rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
            {...register("maxPollas", { valueAsNumber: true })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-brand-primary">Máx. participantes/polla</label>
          <input
            type="number"
            min={0}
            className="w-32 rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
            {...register("maxParticipantesPorPolla", { valueAsNumber: true })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-brand-primary">
          <input type="checkbox" className="h-4 w-4" {...register("permiteLogo")} />
          Logo propio
        </label>
        <label className="flex items-center gap-2 text-sm text-brand-primary">
          <input type="checkbox" className="h-4 w-4" {...register("permiteExportarExcel")} />
          Exportar a Excel
        </label>
        <label className="flex items-center gap-2 text-sm text-brand-primary">
          <input type="checkbox" className="h-4 w-4" {...register("permiteMultiplesAdmins")} />
          Múltiples admins
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>

        {serverError && <p className="w-full text-sm text-red-600">{serverError}</p>}
        {success && <p className="w-full text-sm text-brand-positive">Plan actualizado.</p>}
      </form>
    </div>
  );
}
