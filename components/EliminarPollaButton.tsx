"use client";

import { useState, useTransition } from "react";
import { eliminarPollaAction } from "@/app/org/[orgSlug]/pollas/[pollaSlug]/configuracion/actions";

export function EliminarPollaButton({
  orgSlug,
  pollaSlug,
  nombrePolla,
}: {
  orgSlug: string;
  pollaSlug: string;
  nombrePolla: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const onClick = () => {
    if (
      !confirm(
        `¿Eliminar definitivamente la polla "${nombrePolla}"? Esto borrará sus equipos, partidos, pronósticos y participantes. Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    setServerError(null);
    startTransition(async () => {
      const result = await eliminarPollaAction(orgSlug, pollaSlug);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={onClick}
        className="w-fit rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
      >
        {isPending ? "Eliminando..." : "Eliminar polla"}
      </button>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
    </div>
  );
}
