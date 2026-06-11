import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function getTenantBySlug(slug: string) {
  const organizacion = await prisma.organizacion.findUnique({
    where: { slug },
  });

  if (!organizacion) notFound();

  return organizacion;
}

export async function getMembresia(userId: string, organizacionId: string) {
  return prisma.membresia.findUnique({
    where: { userId_organizacionId: { userId, organizacionId } },
  });
}

export async function getPollaBySlug(organizacionId: string, pollaSlug: string) {
  const polla = await prisma.polla.findUnique({
    where: { organizacionId_slug: { organizacionId, slug: pollaSlug } },
  });

  if (!polla) notFound();

  return polla;
}
