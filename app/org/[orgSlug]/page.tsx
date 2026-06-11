import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgRole } from "@/lib/permissions";
import { SimpleBarChart } from "@/components/SimpleBarChart";

export default async function OrgPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { organizacion, membresia } = await requireOrgRole(orgSlug, [
    "OWNER",
    "ADMIN",
    "MIEMBRO",
  ]);

  const [totalMiembros, pollas] = await Promise.all([
    prisma.membresia.count({ where: { organizacionId: organizacion.id } }),
    prisma.polla.findMany({
      where: { organizacionId: organizacion.id },
      include: { _count: { select: { participantes: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const datosGrafica = pollas.map((p) => ({
    name: p.nombre,
    valor: p._count.participantes,
  }));

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">
          {organizacion.nombre}
        </h1>
        <p className="text-sm text-brand-primary/70">Tu rol: {membresia.role}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-brand-primary/70">Miembros</p>
          <p className="text-2xl font-bold text-brand-primary">{totalMiembros}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-brand-primary/70">Pollas</p>
          <p className="text-2xl font-bold text-brand-primary">{pollas.length}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-brand-primary/70">Plan</p>
          <p className="text-2xl font-bold text-brand-primary">{organizacion.plan}</p>
        </div>
      </div>

      {pollas.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-brand-primary">
            Participantes por polla
          </h2>
          <SimpleBarChart data={datosGrafica} valueLabel="Participantes" color="#e8a020" />
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-primary">Pollas</h2>
          <Link
            href={`/org/${orgSlug}/pollas`}
            className="text-sm font-semibold text-brand-primary hover:underline"
          >
            Ver todas →
          </Link>
        </div>
        {pollas.length === 0 ? (
          <p className="text-brand-primary/70">Todavía no hay pollas creadas en esta organización.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pollas.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <Link
                  href={`/org/${orgSlug}/pollas/${p.slug}`}
                  className="text-brand-primary hover:underline"
                >
                  {p.nombre}
                </Link>
                <span className="text-brand-primary/70">
                  {p._count.participantes} participante{p._count.participantes === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
