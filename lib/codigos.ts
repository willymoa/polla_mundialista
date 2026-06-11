import { randomBytes } from "crypto";

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generarCodigo(longitud = 8): string {
  const bytes = randomBytes(longitud);
  let codigo = "";
  for (let i = 0; i < longitud; i++) {
    codigo += ALFABETO[bytes[i] % ALFABETO.length];
  }
  return codigo;
}
