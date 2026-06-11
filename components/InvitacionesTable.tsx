"use client";

import { useTransition } from "react";
import type { EstadoInvitacion, OrgRole } from "@prisma/client";
import { revocarInvitacionAction } from "@/app/org/[orgSlug]/miembros/actions";

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

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-brand-primary/70">
          <th className="py-2">Código</th>
          <th className="py-2">Rol</th>
          <th className="py-2">Correo</th>
          <th className="py-2">Expira</th>
          <th className="py-2">Estado</th>
          <th className="py-2"></th>
        </tr>
      </thead>
      <tbody>
        {invitaciones.map((inv) => (
          <tr key={inv.id} className="border-b border-gray-100">
            <td className="py-2 font-mono">{inv.codigo}</td>
            <td className="py-2">{inv.roleAsignado}</td>
            <td className="py-2">{inv.emailInvitado ?? "—"}</td>
            <td className="py-2">
              {new Date(inv.fechaExpiracion).toLocaleDateString("es-CO")}
            </td>
            <td className="py-2">{inv.estado}</td>
            <td className="py-2">
              {inv.estado === "PENDIENTE" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await revocarInvitacionAction(orgSlug, inv.id);
                    })
                  }
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
  );
}
