import { prisma } from "@/lib/prisma";
import { PlanesManager } from "@/components/PlanesManager";
import { ensureDefaultPlans } from "@/lib/default-plans";

export default async function AdminPlanesPage() {
  await ensureDefaultPlans();

  const planes = await prisma.plan.findMany({ orderBy: { maxPollas: "asc" } });

  return (
    <main className="page-main">
      <h1 className="text-2xl font-bold text-brand-primary">Planes</h1>
      <PlanesManager planes={planes} />
    </main>
  );
}
