import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/permissions";
import { getTenantBySlug } from "@/lib/tenant";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const user = await requireAuth();
  const organizacion = await getTenantBySlug(orgSlug);

  const membresia = await prisma.membresia.findUnique({
    where: { userId_organizacionId: { userId: user.id, organizacionId: organizacion.id } },
  });

  const esAdmin = membresia?.role === "OWNER" || membresia?.role === "ADMIN";
  const esOwner = membresia?.role === "OWNER";

  return (
    <div className="flex flex-1 flex-col">
      <nav className="flex flex-wrap items-center gap-4 border-b border-gray-200 bg-white px-6 py-3">
        <span className="font-bold text-brand-primary">{organizacion.nombre}</span>
        <Link href={`/org/${orgSlug}`} className="text-sm text-brand-primary/70 hover:text-brand-primary">
          Inicio
        </Link>
        <Link href={`/org/${orgSlug}/pollas`} className="text-sm text-brand-primary/70 hover:text-brand-primary">
          Pollas
        </Link>
        {esAdmin && (
          <Link href={`/org/${orgSlug}/miembros`} className="text-sm text-brand-primary/70 hover:text-brand-primary">
            Miembros
          </Link>
        )}
        {esOwner && (
          <Link href={`/org/${orgSlug}/configuracion`} className="text-sm text-brand-primary/70 hover:text-brand-primary">
            Configuración
          </Link>
        )}
        <Link href="/dashboard" className="ml-auto text-sm text-brand-primary/70 hover:text-brand-primary">
          ← Mis organizaciones
        </Link>
      </nav>
      {children}
    </div>
  );
}
