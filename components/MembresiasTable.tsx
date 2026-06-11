"use client";

import { useState, useTransition } from "react";
import type { EstadoMembresia, OrgRole } from "@prisma/client";
import {
  actualizarMembresiaAction,
  actualizarUsuarioOrgAction,
} from "@/app/org/[orgSlug]/miembros/actions";
import { ResetPasswordModal } from "@/components/ResetPasswordModal";

export type MembresiaRow = {
  id: string;
  role: OrgRole;
  estado: EstadoMembresia;
  user: { id: string; nombre: string; email: string };
};

export function MembresiasTable({
  orgSlug,
  membresias,
  esOwner,
  esAdmin,
  currentUserId,
}: {
  orgSlug: string;
  membresias: MembresiaRow[];
  esOwner: boolean;
  esAdmin: boolean;
  currentUserId: string;
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-brand-primary/70">
          <th className="py-2">Nombre</th>
          <th className="py-2">Correo</th>
          <th className="py-2">Rol</th>
          <th className="py-2">Estado</th>
          {(esOwner || esAdmin) && <th className="py-2">Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {membresias.map((m) => (
          <MembresiaFila
            key={m.id}
            orgSlug={orgSlug}
            membresia={m}
            esOwner={esOwner}
            esAdmin={esAdmin}
            currentUserId={currentUserId}
          />
        ))}
      </tbody>
    </table>
  );
}

function MembresiaFila({
  orgSlug,
  membresia,
  esOwner,
  esAdmin,
  currentUserId,
}: {
  orgSlug: string;
  membresia: MembresiaRow;
  esOwner: boolean;
  esAdmin: boolean;
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<OrgRole>(membresia.role);
  const [estado, setEstado] = useState<EstadoMembresia>(membresia.estado);
  const [nombre, setNombre] = useState(membresia.user.nombre);
  const [email, setEmail] = useState(membresia.user.email);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);

  const esPropio = membresia.user.id === currentUserId;
  const esEditableRol = esOwner && membresia.role !== "OWNER";
  const esEditableUsuario =
    esAdmin && membresia.role !== "OWNER" && !esPropio;

  const guardarMembresia = (nuevoRole: OrgRole, nuevoEstado: EstadoMembresia) => {
    setRole(nuevoRole);
    setEstado(nuevoEstado);
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await actualizarMembresiaAction(orgSlug, {
        membresiaId: membresia.id,
        role: nuevoRole as "ADMIN" | "MIEMBRO",
        estado: nuevoEstado as "ACTIVO" | "SUSPENDIDO",
      });
      if (result?.error) setError(result.error);
    });
  };

  const guardarUsuario = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await actualizarUsuarioOrgAction(orgSlug, {
        userId: membresia.user.id,
        nombre,
        email,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess("Datos actualizados");
      }
    });
  };

  return (
    <>
      <tr className="border-b border-gray-100 align-top">
        <td className="py-2">
          {esEditableUsuario ? (
            <input
              type="text"
              value={nombre}
              disabled={isPending}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded border border-gray-300 px-2 py-1"
            />
          ) : (
            membresia.user.nombre
          )}
        </td>
        <td className="py-2">
          {esEditableUsuario ? (
            <input
              type="email"
              value={email}
              disabled={isPending}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-2 py-1"
            />
          ) : (
            membresia.user.email
          )}
        </td>
        <td className="py-2">
          {esEditableRol ? (
            <select
              value={role}
              disabled={isPending}
              onChange={(e) => guardarMembresia(e.target.value as OrgRole, estado)}
              className="rounded border border-gray-300 px-2 py-1"
            >
              <option value="MIEMBRO">Miembro</option>
              <option value="ADMIN">Administrador</option>
            </select>
          ) : (
            membresia.role
          )}
        </td>
        <td className="py-2">
          {esEditableRol ? (
            <select
              value={estado}
              disabled={isPending}
              onChange={(e) => guardarMembresia(role, e.target.value as EstadoMembresia)}
              className="rounded border border-gray-300 px-2 py-1"
            >
              <option value="ACTIVO">Activo</option>
              <option value="SUSPENDIDO">Suspendido</option>
            </select>
          ) : (
            membresia.estado
          )}
        </td>
        {(esOwner || esAdmin) && (
          <td className="py-2">
            <div className="flex flex-col gap-2">
              {esEditableUsuario && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={guardarUsuario}
                  className="w-fit rounded border border-brand-primary px-2 py-1 text-xs font-semibold text-brand-primary disabled:opacity-60"
                >
                  Guardar datos
                </button>
              )}
              {esEditableUsuario && (
                <button
                  type="button"
                  onClick={() => setShowReset(true)}
                  className="w-fit rounded border border-amber-600 px-2 py-1 text-xs font-semibold text-amber-700"
                >
                  Restablecer contraseña
                </button>
              )}
              {esPropio && (
                <span className="text-xs text-brand-primary/60">Edita tu perfil en Mi cuenta</span>
              )}
              {error && <span className="text-xs text-red-600">{error}</span>}
              {success && <span className="text-xs text-brand-positive">{success}</span>}
            </div>
          </td>
        )}
      </tr>
      {showReset && (
        <ResetPasswordModal
          orgSlug={orgSlug}
          userId={membresia.user.id}
          nombreUsuario={nombre}
          onClose={() => setShowReset(false)}
        />
      )}
    </>
  );
}
