import type { LockMode, EstadoPartido } from "@prisma/client";

export function partidoBloqueado(
  polla: { lockMode: LockMode; deadlineGlobal: Date | null },
  partido: { fechaHora: Date; estado: EstadoPartido }
): boolean {
  if (partido.estado !== "PENDIENTE") return true;

  const ahora = new Date();

  if (polla.lockMode === "GLOBAL_DEADLINE") {
    return polla.deadlineGlobal ? ahora >= new Date(polla.deadlineGlobal) : false;
  }

  return ahora >= new Date(partido.fechaHora);
}
