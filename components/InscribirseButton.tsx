"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { inscribirseAction } from "@/app/org/[orgSlug]/pollas/[pollaSlug]/actions";

export function InscribirseButton({
  orgSlug,
  pollaSlug,
  deshabilitado = false,
  motivoDeshabilitado,
}: {
  orgSlug: string;
  pollaSlug: string;
  deshabilitado?: boolean;
  motivoDeshabilitado?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (deshabilitado) {
    return (
      <p className="text-sm text-brand-primary/70">
        {motivoDeshabilitado ?? "No puedes inscribirte en esta polla."}
      </p>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await inscribirseAction(orgSlug, pollaSlug);
          router.refresh();
        })
      }
      className="rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
    >
      {isPending ? "Inscribiendo..." : "Inscribirme en esta polla"}
    </button>
  );
}
