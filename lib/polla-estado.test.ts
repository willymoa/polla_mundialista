import { describe, it, expect } from "vitest";
import {
  esAdminOrg,
  pollaVisibleParaUsuario,
  pollaPermiteEscritura,
  pollaPermiteConfiguracion,
} from "@/lib/polla-estado";

describe("polla-estado", () => {
  const adminOrg = { role: "ADMIN" as const };
  const ownerOrg = { role: "OWNER" as const };
  const miembroOrg = { role: "MIEMBRO" as const };

  describe("pollaVisibleParaUsuario", () => {
    it("oculta pollas OCULTA para miembros normales", () => {
      expect(pollaVisibleParaUsuario({ estado: "OCULTA" }, miembroOrg)).toBe(false);
    });

    it("muestra pollas OCULTA a admins de org", () => {
      expect(pollaVisibleParaUsuario({ estado: "OCULTA" }, adminOrg)).toBe(true);
      expect(pollaVisibleParaUsuario({ estado: "OCULTA" }, ownerOrg)).toBe(true);
    });

    it("muestra pollas ACTIVA e INACTIVA a todos", () => {
      expect(pollaVisibleParaUsuario({ estado: "ACTIVA" }, miembroOrg)).toBe(true);
      expect(pollaVisibleParaUsuario({ estado: "INACTIVA" }, miembroOrg)).toBe(true);
    });
  });

  describe("pollaPermiteEscritura", () => {
    it("bloquea escritura en INACTIVA y OCULTA", () => {
      expect(pollaPermiteEscritura({ estado: "INACTIVA" })).toBe(false);
      expect(pollaPermiteEscritura({ estado: "OCULTA" })).toBe(false);
    });

    it("permite escritura en ACTIVA", () => {
      expect(pollaPermiteEscritura({ estado: "ACTIVA" })).toBe(true);
    });
  });

  describe("pollaPermiteConfiguracion", () => {
    it("permite configuración a admin de org en polla oculta", () => {
      expect(
        pollaPermiteConfiguracion({ estado: "OCULTA" }, adminOrg, false)
      ).toBe(true);
    });

    it("no permite configuración a miembro en polla oculta", () => {
      expect(
        pollaPermiteConfiguracion({ estado: "OCULTA" }, miembroOrg, false)
      ).toBe(false);
    });
  });

  describe("esAdminOrg", () => {
    it("identifica OWNER y ADMIN", () => {
      expect(esAdminOrg(adminOrg)).toBe(true);
      expect(esAdminOrg(ownerOrg)).toBe(true);
      expect(esAdminOrg(miembroOrg)).toBe(false);
    });
  });
});
