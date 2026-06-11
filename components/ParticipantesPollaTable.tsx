"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EstadoMembresia, PollaRole } from "@prisma/client";
import {
  actualizarParticipanteAction,
  eliminarParticipanteAction,
} from "@/app/org/[orgSlug]/pollas/[pollaSlug]/configuracion/actions";

type EstadoParticipante = "ACTIVO" | "SUSPENDIDO";

export type ParticipanteRow = {
  id: string;
  role: PollaRole;
  estado: EstadoMembresia;
  pago: boolean;
  puntosTotales: number;
  user: { nombre: string; email: string };
};

export function ParticipantesPollaTable({
  orgSlug,
  pollaSlug,
  participantes,
}: {
  orgSlug: string;
  pollaSlug: string;
  participantes: ParticipanteRow[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (participantes.length === 0) {
    return <p className="text-sm text-brand-primary/70">Aún no hay participantes inscritos.</p>;
  }

  const actualizar = (
    p: ParticipanteRow,
    cambios: Partial<{ role: PollaRole; estado: EstadoParticipante; pago: boolean }>
  ) => {
    const estadoActual: EstadoParticipante = p.estado === "SUSPENDIDO" ? "SUSPENDIDO" : "ACTIVO";
    startTransition(async () => {
      await actualizarParticipanteAction(orgSlug, pollaSlug, {
        participanteId: p.id,
        role: cambios.role ?? p.role,
        estado: cambios.estado ?? estadoActual,
        pago: cambios.pago ?? p.pago,
      });
      router.refresh();
    });
  };

  const eliminar = (p: ParticipanteRow) => {
    if (!confirm(`¿Eliminar a ${p.user.nombre} de esta polla? Se borrarán también sus pronósticos.`)) {
      return;
    }
    startTransition(async () => {
      await eliminarParticipanteAction(orgSlug, pollaSlug, { participanteId: p.id });
      router.refresh();
    });
  };

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-brand-primary/70">
          <th className="py-2">Nombre</th>
          <th className="py-2">Correo</th>
          <th className="py-2">Rol</th>
          <th className="py-2">Estado</th>
          <th className="py-2">Pago</th>
          <th className="py-2">Puntos</th>
          <th className="py-2"></th>
        </tr>
      </thead>
      <tbody>
        {participantes.map((p) => (
          <tr key={p.id} className="border-b border-gray-100">
            <td className="py-2">{p.user.nombre}</td>
            <td className="py-2">{p.user.email}</td>
            <td className="py-2">
              <select
                disabled={isPending}
                value={p.role}
                onChange={(e) => actualizar(p, { role: e.target.value as PollaRole })}
                className="rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-primary focus:outline-none"
              >
                <option value="ADMIN_POLLA">Admin de polla</option>
                <option value="PARTICIPANTE">Participante</option>
                <option value="ESPECTADOR">Espectador</option>
              </select>
            </td>
            <td className="py-2">
              <select
                disabled={isPending}
                value={p.estado}
                onChange={(e) => actualizar(p, { estado: e.target.value as EstadoParticipante })}
                className="rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-primary focus:outline-none"
              >
                <option value="ACTIVO">Activo</option>
                <option value="SUSPENDIDO">Suspendido</option>
              </select>
            </td>
            <td className="py-2">
              <input
                type="checkbox"
                disabled={isPending}
                checked={p.pago}
                onChange={(e) => actualizar(p, { pago: e.target.checked })}
                className="h-4 w-4"
              />
            </td>
            <td className="py-2">{p.puntosTotales}</td>
            <td className="py-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => eliminar(p)}
                className="rounded-lg border border-red-300 px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
