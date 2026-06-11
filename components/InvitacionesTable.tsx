"use client";

import { useTransition } from "react";
import type { EstadoInvitacion, OrgRole } from "@prisma/client";
import { revocarInvitacionAction } from "@/app/org/[orgSlug]/miembros/actions";
import { TableScroll } from "@/components/TableScroll";

export type InvitacionRow = {
  id: string;
  codigo: string;
  roleAsignado: OrgRole;
  emailInvitado: string | null;
  estado: EstadoInvitacion;
  fechaExpiracion: Date;
};

export function InvitacionesTable({
  orgSlug,
  invitaciones,
}: {
  orgSlug: string;
  invitaciones: InvitacionRow[];
}) {
  const [isPending, startTransition] = useTransition();

  if (invitaciones.length === 0) {
    return <p className="text-sm text-brand-primary/70">No hay invitaciones activas.</p>;
  }

  const revocar = (invId: string) => {
    startTransition(async () => {
      await revocarInvitacionAction(orgSlug, invId);
    });
  };

  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {invitaciones.map((inv) => (
          <li key={inv.id} className="rounded-lg border border-gray-100 bg-brand-background/40 p-4">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono font-semibold text-brand-primary">{inv.codigo}</span>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-brand-primary/70">
                  {inv.estado}
                </span>
              </div>
              <p>
                <span className="text-brand-primary/60">Rol: </span>
                {inv.roleAsignado}
              </p>
              <p className="break-all">
                <span className="text-brand-primary/60">Correo: </span>
                {inv.emailInvitado ?? "—"}
              </p>
              <p>
                <span className="text-brand-primary/60">Expira: </span>
                {new Date(inv.fechaExpiracion).toLocaleDateString("es-CO")}
              </p>
              {inv.estado === "PENDIENTE" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => revocar(inv.id)}
                  className="mt-1 w-full rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  Revocar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <TableScroll className="hidden md:block">
        <table className="table-responsive">
          <thead>
            <tr className="border-b border-gray-200 text-brand-primary/70">
              <th className="py-2 pr-4">Código</th>
              <th className="py-2 pr-4">Rol</th>
              <th className="py-2 pr-4">Correo</th>
              <th className="py-2 pr-4">Expira</th>
              <th className="py-2 pr-4">Estado</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {invitaciones.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-100">
                <td className="py-2 pr-4 font-mono">{inv.codigo}</td>
                <td className="py-2 pr-4">{inv.roleAsignado}</td>
                <td className="py-2 pr-4">{inv.emailInvitado ?? "—"}</td>
                <td className="py-2 pr-4">
                  {new Date(inv.fechaExpiracion).toLocaleDateString("es-CO")}
                </td>
                <td className="py-2 pr-4">{inv.estado}</td>
                <td className="py-2">
                  {inv.estado === "PENDIENTE" && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => revocar(inv.id)}
                      className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-60"
                    >
                      Revocar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </>
  );
}
