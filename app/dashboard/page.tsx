import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth, getUserOrganizations } from "@/lib/permissions";
import { signOut } from "@/lib/auth";
import { SimpleBarChart } from "@/components/SimpleBarChart";
import { esAdminOrg } from "@/lib/polla-estado";

export default async function DashboardPage() {
  const user = await requireAuth();
  const membresias = await getUserOrganizations(user.id);

  const participaciones = await prisma.participantePolla.findMany({
    where: { userId: user.id },
    include: {
      polla: {
        select: {
          nombre: true,
          slug: true,
          estado: true,
          organizacion: { select: { slug: true, nombre: true } },
        },
      },
    },
    orderBy: { puntosTotales: "desc" },
  });

  const rolesPorOrg = new Map(membresias.map((m) => [m.organizacion.slug, m]));

  const participacionesVisibles = participaciones.filter((p) => {
    if (p.polla.estado !== "OCULTA") return true;
    const membresia = rolesPorOrg.get(p.polla.organizacion.slug);
    return membresia && esAdminOrg(membresia);
  });

  const datosGrafica = participacionesVisibles.map((p) => ({
    name: p.polla.nombre,
    valor: p.puntosTotales,
  }));

  return (
    <main className="page-main">
      <div className="page-header">
        <h1 className="page-title">
          Hola, {user.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/cuenta"
            className="rounded-lg border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
          >
            Mi cuenta
          </Link>
          {user.globalRole === "SUPER_ADMIN" && (
            <Link
              href="/admin-platform"
              className="rounded-lg border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
            >
              Panel SUPER ADMIN
            </Link>
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="rounded-lg border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      {membresias.length === 0 ? (
        <div className="card">
          <p className="text-brand-primary/70">
            Aún no perteneces a ninguna organización.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {membresias.map((m) => (
            <Link
              key={m.id}
              href={`/org/${m.organizacion.slug}`}
              className="card transition hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-brand-primary">
                {m.organizacion.nombre}
              </h2>
              <p className="text-sm text-brand-primary/70">
                Rol: {m.role}
              </p>
            </Link>
          ))}
        </div>
      )}

      {participacionesVisibles.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-brand-primary">
            Tus puntos por polla
          </h2>
          <SimpleBarChart data={datosGrafica} valueLabel="Puntos" />
          <ul className="mt-4 flex flex-col gap-2">
            {participacionesVisibles.map((p) => (
              <li key={p.id} className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={`/org/${p.polla.organizacion.slug}/pollas/${p.polla.slug}`}
                  className="text-brand-primary hover:underline"
                >
                  {p.polla.organizacion.nombre} · {p.polla.nombre}
                </Link>
                <span className="font-semibold text-brand-primary">{p.puntosTotales} pts</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
