import { prisma } from "@/lib/prisma";

const DEFAULT_PLANS = [
  {
    nombre: "GRATIS",
    maxPollas: 1,
    maxParticipantesPorPolla: 20,
    permiteLogo: false,
    permiteExportarExcel: false,
    permiteMultiplesAdmins: false,
  },
  {
    nombre: "BASICO",
    maxPollas: 3,
    maxParticipantesPorPolla: 50,
    permiteLogo: true,
    permiteExportarExcel: false,
    permiteMultiplesAdmins: false,
  },
  {
    nombre: "PRO",
    maxPollas: 10,
    maxParticipantesPorPolla: 200,
    permiteLogo: true,
    permiteExportarExcel: true,
    permiteMultiplesAdmins: true,
  },
  {
    nombre: "EMPRESA",
    maxPollas: 100,
    maxParticipantesPorPolla: 5000,
    permiteLogo: true,
    permiteExportarExcel: true,
    permiteMultiplesAdmins: true,
  },
] as const;

export async function ensureDefaultPlans() {
  const count = await prisma.plan.count();
  if (count > 0) return;

  await prisma.plan.createMany({ data: [...DEFAULT_PLANS] });
}
