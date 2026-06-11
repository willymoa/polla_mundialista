"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { equipoSchema, type EquipoInput } from "@/lib/validations";
import {
  crearEquipoAction,
  editarEquipoAction,
  eliminarEquipoAction,
} from "@/app/org/[orgSlug]/pollas/[pollaSlug]/equipos/actions";
import { TableScroll } from "@/components/TableScroll";

export type EquipoRow = {
  id: string;
  nombre: string;
  grupo: string | null;
  banderaUrl: string | null;
};

export function EquiposManager({
  orgSlug,
  pollaSlug,
  equipos,
  esAdmin,
}: {
  orgSlug: string;
  pollaSlug: string;
  equipos: EquipoRow[];
  esAdmin: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      {esAdmin && <NuevoEquipoForm orgSlug={orgSlug} pollaSlug={pollaSlug} />}

      {equipos.length === 0 ? (
        <p className="text-sm text-brand-primary/70">Aún no hay equipos registrados.</p>
      ) : (
        <TableScroll>
        <table className="table-responsive">
          <thead>
            <tr className="border-b border-gray-200 text-brand-primary/70">
              <th className="py-2">Nombre</th>
              <th className="py-2">Grupo</th>
              <th className="py-2">Bandera</th>
              {esAdmin && <th className="py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {equipos.map((equipo) => (
              <EquipoFila
                key={equipo.id}
                orgSlug={orgSlug}
                pollaSlug={pollaSlug}
                equipo={equipo}
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

function NuevoEquipoForm({ orgSlug, pollaSlug }: { orgSlug: string; pollaSlug: string }) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EquipoInput>({
    resolver: zodResolver(equipoSchema),
    defaultValues: { nombre: "", grupo: "", banderaUrl: "" },
  });

  const onSubmit = (values: EquipoInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await crearEquipoAction(orgSlug, pollaSlug, values);
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
        <label htmlFor="nombre" className="text-sm font-medium text-brand-primary">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("nombre")}
        />
        {errors.nombre && <p className="text-sm text-red-600">{errors.nombre.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="grupo" className="text-sm font-medium text-brand-primary">
          Grupo (opcional)
        </label>
        <input
          id="grupo"
          type="text"
          placeholder="A"
          className="w-24 rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("grupo")}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="banderaUrl" className="text-sm font-medium text-brand-primary">
          URL bandera (opcional)
        </label>
        <input
          id="banderaUrl"
          type="text"
          placeholder="https://..."
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-primary focus:outline-none"
          {...register("banderaUrl")}
        />
        {errors.banderaUrl && (
          <p className="text-sm text-red-600">{errors.banderaUrl.message}</p>
        )}
      </div>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Agregando..." : "Agregar equipo"}
      </button>
    </form>
  );
}

function EquipoFila({
  orgSlug,
  pollaSlug,
  equipo,
  esAdmin,
}: {
  orgSlug: string;
  pollaSlug: string;
  equipo: EquipoRow;
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
  } = useForm<EquipoInput>({
    resolver: zodResolver(equipoSchema),
    defaultValues: {
      nombre: equipo.nombre,
      grupo: equipo.grupo ?? "",
      banderaUrl: equipo.banderaUrl ?? "",
    },
  });

  const onSubmit = (values: EquipoInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await editarEquipoAction(orgSlug, pollaSlug, equipo.id, values);
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
      const result = await eliminarEquipoAction(orgSlug, pollaSlug, equipo.id);
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
        <td className="py-2" colSpan={esAdmin ? 4 : 3}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              className="rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-primary focus:outline-none"
              {...register("nombre")}
            />
            <input
              type="text"
              placeholder="Grupo"
              className="w-20 rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-primary focus:outline-none"
              {...register("grupo")}
            />
            <input
              type="text"
              placeholder="URL bandera"
              className="rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-primary focus:outline-none"
              {...register("banderaUrl")}
            />
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
            {errors.nombre && <p className="text-sm text-red-600">{errors.nombre.message}</p>}
            {errors.banderaUrl && (
              <p className="text-sm text-red-600">{errors.banderaUrl.message}</p>
            )}
            {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-gray-100">
      <td className="py-2">{equipo.nombre}</td>
      <td className="py-2">{equipo.grupo ?? "—"}</td>
      <td className="py-2">{equipo.banderaUrl ?? "—"}</td>
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
