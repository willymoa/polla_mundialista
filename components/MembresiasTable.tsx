"use client";

import { useState, useTransition } from "react";
import type { EstadoMembresia, OrgRole } from "@prisma/client";
import {
  actualizarMembresiaAction,
  actualizarUsuarioOrgAction,
} from "@/app/org/[orgSlug]/miembros/actions";
import { ResetPasswordModal } from "@/components/ResetPasswordModal";
import { TableScroll } from "@/components/TableScroll";

export type MembresiaRow = {
  id: string;
  role: OrgRole;
  estado: EstadoMembresia;
  user: { id: string; nombre: string; email: string };
};

const ROLE_LABEL: Record<OrgRole, string> = {
  OWNER: "Propietario",
  ADMIN: "Administrador",
  MIEMBRO: "Miembro",
};

const ESTADO_LABEL: Record<EstadoMembresia, string> = {
  ACTIVO: "Activo",
  INVITADO: "Invitado",
  SUSPENDIDO: "Suspendido",
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
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {membresias.map((m) => (
          <MembresiaItem
            key={m.id}
            variant="card"
            orgSlug={orgSlug}
            membresia={m}
            esOwner={esOwner}
            esAdmin={esAdmin}
            currentUserId={currentUserId}
          />
        ))}
      </ul>

      <TableScroll className="hidden md:block">
        <table className="table-responsive">
          <thead>
            <tr className="border-b border-gray-200 text-brand-primary/70">
              <th className="py-2 pr-4">Nombre</th>
              <th className="py-2 pr-4">Correo</th>
              <th className="py-2 pr-4">Rol</th>
              <th className="py-2 pr-4">Estado</th>
              {(esOwner || esAdmin) && <th className="py-2">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {membresias.map((m) => (
              <MembresiaItem
                key={m.id}
                variant="row"
                orgSlug={orgSlug}
                membresia={m}
                esOwner={esOwner}
                esAdmin={esAdmin}
                currentUserId={currentUserId}
              />
            ))}
          </tbody>
        </table>
      </TableScroll>
    </>
  );
}

function MembresiaItem({
  variant,
  orgSlug,
  membresia,
  esOwner,
  esAdmin,
  currentUserId,
}: {
  variant: "card" | "row";
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
  const esEditableUsuario = esAdmin && membresia.role !== "OWNER" && !esPropio;
  const muestraAcciones = esOwner || esAdmin;

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

  const acciones = muestraAcciones && (
    <div className="flex flex-col gap-2">
      {esEditableUsuario && (
        <button
          type="button"
          disabled={isPending}
          onClick={guardarUsuario}
          className="w-full rounded-lg border border-brand-primary px-3 py-2 text-sm font-semibold text-brand-primary disabled:opacity-60 sm:w-fit"
        >
          Guardar datos
        </button>
      )}
      {esEditableUsuario && (
        <button
          type="button"
          onClick={() => setShowReset(true)}
          className="w-full rounded-lg border border-amber-600 px-3 py-2 text-sm font-semibold text-amber-700 sm:w-fit"
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
  );

  const nombreField = esEditableUsuario ? (
    <input
      type="text"
      value={nombre}
      disabled={isPending}
      onChange={(e) => setNombre(e.target.value)}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
    />
  ) : (
    <span className="text-sm text-brand-primary">{membresia.user.nombre}</span>
  );

  const emailField = esEditableUsuario ? (
    <input
      type="email"
      value={email}
      disabled={isPending}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
    />
  ) : (
    <span className="break-all text-sm text-brand-primary">{membresia.user.email}</span>
  );

  const rolField = esEditableRol ? (
    <select
      value={role}
      disabled={isPending}
      onChange={(e) => guardarMembresia(e.target.value as OrgRole, estado)}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
    >
      <option value="MIEMBRO">Miembro</option>
      <option value="ADMIN">Administrador</option>
    </select>
  ) : (
    <span className="text-sm text-brand-primary">{ROLE_LABEL[membresia.role] ?? membresia.role}</span>
  );

  const estadoField = esEditableRol ? (
    <select
      value={estado}
      disabled={isPending}
      onChange={(e) => guardarMembresia(role, e.target.value as EstadoMembresia)}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
    >
      <option value="ACTIVO">Activo</option>
      <option value="SUSPENDIDO">Suspendido</option>
    </select>
  ) : (
    <span className="text-sm text-brand-primary">
      {ESTADO_LABEL[membresia.estado] ?? membresia.estado}
    </span>
  );

  const modal = showReset && (
    <ResetPasswordModal
      orgSlug={orgSlug}
      userId={membresia.user.id}
      nombreUsuario={nombre}
      onClose={() => setShowReset(false)}
    />
  );

  if (variant === "card") {
    return (
      <li className="rounded-lg border border-gray-100 bg-brand-background/40 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-primary/60">Nombre</span>
            {nombreField}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-primary/60">Correo</span>
            {emailField}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-primary/60">Rol</span>
              {rolField}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-primary/60">Estado</span>
              {estadoField}
            </div>
          </div>
          {muestraAcciones && acciones}
        </div>
        {modal}
      </li>
    );
  }

  return (
    <>
      <tr className="border-b border-gray-100 align-top">
        <td className="py-2 pr-4">{nombreField}</td>
        <td className="py-2 pr-4">{emailField}</td>
        <td className="py-2 pr-4">{rolField}</td>
        <td className="py-2 pr-4">{estadoField}</td>
        {muestraAcciones && <td className="py-2">{acciones}</td>}
      </tr>
      {modal}
    </>
  );
}
