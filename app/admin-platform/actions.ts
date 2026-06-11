"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/permissions";
import type { PlanTipo } from "@prisma/client";
import {
  cambiarPlanOrganizacionSchema,
  editarPlanSchema,
  type CambiarPlanOrganizacionInput,
  type EditarPlanInput,
} from "@/lib/validations";

const PLAN_TIPOS: PlanTipo[] = ["GRATIS", "BASICO", "PRO", "EMPRESA"];

export async function cambiarPlanOrganizacionAction(values: CambiarPlanOrganizacionInput) {
  await requireSuperAdmin();

  const parsed = cambiarPlanOrganizacionSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const { organizacionId, planId } = parsed.data;

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    return { error: "Plan no encontrado" };
  }

  const planTipo = PLAN_TIPOS.find((tipo) => tipo === plan.nombre.toUpperCase());

  await prisma.organizacion.update({
    where: { id: organizacionId },
    data: {
      planId: plan.id,
      ...(planTipo ? { plan: planTipo } : {}),
    },
  });

  revalidatePath("/admin-platform/organizaciones");
  return { success: true };
}

export async function editarPlanAction(planId: string, values: EditarPlanInput) {
  await requireSuperAdmin();

  const parsed = editarPlanSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  await prisma.plan.update({
    where: { id: planId },
    data: parsed.data,
  });

  revalidatePath("/admin-platform/planes");
  revalidatePath("/admin-platform/organizaciones");
  return { success: true };
}
