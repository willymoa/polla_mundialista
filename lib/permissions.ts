import { notFound, redirect } from "next/navigation";
import type { EstadoPolla, OrgRole, PollaRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTenantBySlug, getPollaBySlug } from "@/lib/tenant";
import { pollaPermiteEscritura, pollaVisibleParaUsuario } from "@/lib/polla-estado";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;

  return prisma.user.findUnique({ where: { id: session.user.id } });
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

export async function requireSuperAdmin() {
  const user = await requireAuth();
  if (user.globalRole !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

export async function getUserOrganizations(userId: string) {
  return prisma.membresia.findMany({
    where: { userId },
    include: { organizacion: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function requireOrgRole(orgSlug: string, roles: OrgRole[]) {
  const user = await requireAuth();
  const organizacion = await getTenantBySlug(orgSlug);

  const membresia = await prisma.membresia.findUnique({
    where: {
      userId_organizacionId: { userId: user.id, organizacionId: organizacion.id },
    },
  });

  if (!membresia || membresia.estado !== "ACTIVO") {
    notFound();
  }

  if (!roles.includes(membresia.role)) {
    redirect(`/org/${orgSlug}`);
  }

  return { user, organizacion, membresia };
}

export function esAdminPolla(
  membresiaOrg: { role: OrgRole },
  participante: { role: PollaRole } | null
) {
  return (
    membresiaOrg.role === "OWNER" ||
    membresiaOrg.role === "ADMIN" ||
    participante?.role === "ADMIN_POLLA"
  );
}

export async function requirePollaAccess(orgSlug: string, pollaSlug: string) {
  const { user, organizacion, membresia } = await requireOrgRole(orgSlug, [
    "OWNER",
    "ADMIN",
    "MIEMBRO",
  ]);
  const polla = await getPollaBySlug(organizacion.id, pollaSlug);

  if (!pollaVisibleParaUsuario(polla, membresia)) {
    notFound();
  }

  const participante = await prisma.participantePolla.findUnique({
    where: { userId_pollaId: { userId: user.id, pollaId: polla.id } },
  });

  return { user, organizacion, membresiaOrg: membresia, polla, participante };
}

export function errorSiPollaNoEscritura(polla: { estado: EstadoPolla }): string | null {
  if (!pollaPermiteEscritura(polla)) {
    return "Esta polla está inactiva u oculta. No se permiten cambios.";
  }
  return null;
}

export async function requirePollaRole(
  orgSlug: string,
  pollaSlug: string,
  roles: PollaRole[]
) {
  const ctx = await requirePollaAccess(orgSlug, pollaSlug);

  const tieneRol = ctx.participante && roles.includes(ctx.participante.role);
  if (!tieneRol && !esAdminPolla(ctx.membresiaOrg, ctx.participante)) {
    redirect(`/org/${orgSlug}/pollas/${pollaSlug}`);
  }

  return ctx;
}
