"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { EstadoPartido } from "@prisma/client";
import { partidoSchema, type PartidoInput } from "@/lib/validations";
import {
  crearPartidoAction,
  editarPartidoAction,
  eliminarPartidoAction,
} from "@/app/org/[orgSlug]/pollas/[pollaSlug]/partidos/actions";
import { TableScroll } from "@/components/TableScroll";

const ESTADO_LABEL: Record<EstadoPartido, string> = {
  PENDIENTE: "Pendiente",
  CERRADO: "Cerrado",
  FINALIZADO: "Finalizado",
};

export type EquipoOption = { id: string; nombre: string };

export type PartidoRow = {
  id: string;
  equipoLocalId: string;
  equipoVisitanteId: string;
  fechaHora: Date;
  fase: string | null;
  estado: EstadoPartido;
  golesLocalReal: number | null;
  golesVisitanteReal: number | null;
  equipoLocal: { nombre: string };
  equipoVisitante: { nombre: string };
};

function toDatetimeLocal(date: Date): string {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function PartidosManager({
  orgSlug,
  pollaSlug,
  partidos,
  equipos,
  esAdmin,
}: {
  orgSlug: string;
  pollaSlug: string;
  partidos: PartidoRow[];
  equipos: EquipoOption[];
  esAdmin: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      {esAdmin && equipos.length >= 2 && (
        <NuevoPartidoForm orgSlug={orgSlug} pollaSlug={pollaSlug} equipos={equipos} />
      )}
      {esAdmin && equipos.length < 2 && (
        <p className="text-sm text-brand-primary/70">
          Registra al menos dos equipos para poder crear partidos.
        </p>
      )}

      {partidos.length === 0 ? (
        <p className="text-sm text-brand-primary/70">Aún no hay partidos registrados.</p>
      ) : (
        <TableScroll>
        <table className="table-responsive">
          <thead>
            <tr className="border-b border-gray-200 text-brand-primary/70">
              <th className="py-2">Partido</th>
              <th className="py-2">Fase</th>
              <th className="py-2">Fecha y hora</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Resultado</th>
              {esAdmin && <th className="py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {partidos.map((partido) => (
              <PartidoFila
                key={partido.id}
                orgSlug={orgSlug}
                pollaSlug={pollaSlug}
                partido={partido}
                equipos={equipos}
                esAdmin={esAdmin}
              />
            ))}
          </tbody>
        </table>
        </TableScroll>
      )}
    </div>
  );
}

function NuevoPartidoForm({
  orgSlug,
  pollaSlug,
  equipos,
}: {
  orgSlug: string;
  pollaSlug: string;
  equipos: EquipoOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartidoInput>({
    resolver: zodResolver(partidoSchema),
    defaultValues: {
      equipoLocalId: equipos[0]?.id ?? "",
      equipoVisitanteId: equipos[1]?.id ?? "",
      fechaHora: "",
      fase: "",
      estado: "PENDIENTE",
    },
  });

  const onSubmit = (values: PartidoInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await crearPartidoAction(orgSlug, pollaSlug, values);
      if (result?.error) {
        setServerError(result.error);
      } else {
        reset();
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-brand-primary">Local</label>
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("equipoLocalId")}
        >
          {equipos.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-brand-primary">Visitante</label>
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("equipoVisitanteId")}
        >
          {equipos.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
        {errors.equipoVisitanteId && (
          <p className="text-sm text-red-600">{errors.equipoVisitanteId.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-brand-primary">Fecha y hora</label>
        <input
          type="datetime-local"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("fechaHora")}
        />
        {errors.fechaHora && <p className="text-sm text-red-600">{errors.fechaHora.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-brand-primary">Fase (opcional)</label>
        <input
          type="text"
          placeholder="Fase de grupos"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("fase")}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-brand-primary">Estado</label>
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("estado")}
        >
          <option value="PENDIENTE">Pendiente</option>
          <option value="CERRADO">Cerrado</option>
          <option value="FINALIZADO">Finalizado</option>
        </select>
      </div>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Agregando..." : "Agregar partido"}
      </button>
    </form>
  );
}

function PartidoFila({
  orgSlug,
  pollaSlug,
  partido,
  equipos,
  esAdmin,
}: {
  orgSlug: string;
  pollaSlug: string;
  partido: PartidoRow;
  equipos: EquipoOption[];
  esAdmin: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartidoInput>({
    resolver: zodResolver(partidoSchema),
    defaultValues: {
      equipoLocalId: partido.equipoLocalId,
      equipoVisitanteId: partido.equipoVisitanteId,
      fechaHora: toDatetimeLocal(partido.fechaHora),
      fase: partido.fase ?? "",
      estado: partido.estado,
    },
  });

  const onSubmit = (values: PartidoInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await editarPartidoAction(orgSlug, pollaSlug, partido.id, values);
      if (result?.error) {
        setServerError(result.error);
      } else {
        setEditando(false);
        router.refresh();
      }
    });
  };

  const onDelete = () => {
    setServerError(null);
    startTransition(async () => {
      const result = await eliminarPartidoAction(orgSlug, pollaSlug, partido.id);
      if (result?.error) {
        setServerError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  if (editando) {
    return (
      <tr className="border-b border-gray-100">
        <td className="py-2" colSpan={esAdmin ? 6 : 5}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-primary focus:outline-none"
              {...register("equipoLocalId")}
            >
              {equipos.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
            <span className="text-brand-primary/70">vs</span>
            <select
              className="rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-primary focus:outline-none"
              {...register("equipoVisitanteId")}
            >
              {equipos.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              className="rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-primary focus:outline-none"
              {...register("fechaHora")}
            />
            <input
              type="text"
              placeholder="Fase"
              className="w-32 rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-primary focus:outline-none"
              {...register("fase")}
            />
            <select
              className="rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-primary focus:outline-none"
              {...register("estado")}
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="CERRADO">Cerrado</option>
              <option value="FINALIZADO">Finalizado</option>
            </select>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-brand-accent px-3 py-1 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="text-sm text-brand-primary/70 hover:underline"
            >
              Cancelar
            </button>
            {errors.equipoVisitanteId && (
              <p className="text-sm text-red-600">{errors.equipoVisitanteId.message}</p>
            )}
            {errors.fechaHora && (
              <p className="text-sm text-red-600">{errors.fechaHora.message}</p>
            )}
            {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-gray-100">
      <td className="py-2">
        {partido.equipoLocal.nombre} vs {partido.equipoVisitante.nombre}
      </td>
      <td className="py-2">{partido.fase ?? "—"}</td>
      <td className="py-2">{new Date(partido.fechaHora).toLocaleString("es-CO")}</td>
      <td className="py-2">{ESTADO_LABEL[partido.estado]}</td>
      <td className="py-2">
        {partido.golesLocalReal !== null && partido.golesVisitanteReal !== null
          ? `${partido.golesLocalReal} - ${partido.golesVisitanteReal}`
          : "—"}
      </td>
      {esAdmin && (
        <td className="py-2">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="text-sm font-semibold text-brand-primary hover:underline"
            >
              Editar
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={onDelete}
              className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-60"
            >
              Eliminar
            </button>
          </div>
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        </td>
      )}
    </tr>
  );
}
