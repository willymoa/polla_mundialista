import type { EstadoPolla, OrgRole } from "@prisma/client";

export const ESTADO_POLLA_LABEL: Record<EstadoPolla, string> = {
  BORRADOR: "Borrador",
  ACTIVA: "Activa",
  FINALIZADA: "Finalizada",
  ARCHIVADA: "Archivada",
  OCULTA: "Oculta",
  INACTIVA: "Inactiva",
};

export const ESTADO_POLLA_BADGE: Record<EstadoPolla, string> = {
  BORRADOR: "bg-gray-100 text-gray-700",
  ACTIVA: "bg-brand-positive/20 text-brand-positive",
  FINALIZADA: "bg-blue-100 text-blue-700",
  ARCHIVADA: "bg-gray-200 text-gray-600",
  OCULTA: "bg-gray-300 text-gray-700",
  INACTIVA: "bg-amber-100 text-amber-800",
};

export function esAdminOrg(membresiaOrg: { role: OrgRole }): boolean {
  return membresiaOrg.role === "OWNER" || membresiaOrg.role === "ADMIN";
}

export function pollaVisibleParaUsuario(
  polla: { estado: EstadoPolla },
  membresiaOrg: { role: OrgRole }
): boolean {
  if (polla.estado !== "OCULTA") return true;
  return esAdminOrg(membresiaOrg);
}

export function pollaPermiteEscritura(polla: { estado: EstadoPolla }): boolean {
  return polla.estado !== "INACTIVA" && polla.estado !== "OCULTA";
}

export function pollaPermiteConfiguracion(
  polla: { estado: EstadoPolla },
  membresiaOrg: { role: OrgRole },
  esAdminDePolla: boolean
): boolean {
  if (!pollaVisibleParaUsuario(polla, membresiaOrg)) return false;
  return esAdminOrg(membresiaOrg) || esAdminDePolla;
}

export function mensajeEstadoPolla(estado: EstadoPolla): string | null {
  if (estado === "OCULTA") {
    return "Esta polla está oculta. Solo la ven administradores de la organización.";
  }
  if (estado === "INACTIVA") {
    return "Esta polla está inactiva. Solo puedes consultar información; no se permiten cambios ni pronósticos.";
  }
  return null;
}
