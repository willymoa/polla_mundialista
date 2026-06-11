"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export type NavLink = {
  href: string;
  label: string;
};

export function AppNav({
  title,
  links,
  backLink,
}: {
  title: string;
  links: NavLink[];
  backLink?: NavLink;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkClass = (href: string) => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
    return `text-sm transition ${
      active
        ? "font-semibold text-brand-primary"
        : "text-brand-primary/70 hover:text-brand-primary"
    }`;
  };

  const mobileLinkClass = (href: string) => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
    return `block rounded-lg px-4 py-3 text-base transition ${
      active
        ? "bg-brand-background font-semibold text-brand-primary"
        : "text-brand-primary/80 hover:bg-gray-50"
    }`;
  };

  return (
    <header className="relative z-30 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2 px-4 py-3 sm:px-6">
        <button
          type="button"
          className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-brand-primary hover:bg-gray-100 md:hidden"
          aria-expanded={open}
          aria-controls="app-nav-drawer"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
        </button>

        <span className="min-w-0 flex-1 truncate font-bold text-brand-primary">{title}</span>

        <nav className="hidden flex-1 flex-wrap items-center gap-4 md:flex" aria-label="Navegación principal">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
          {backLink && (
            <Link href={backLink.href} className={`ml-auto ${linkClass(backLink.href)}`}>
              ← {backLink.label}
            </Link>
          )}
        </nav>
      </div>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />
      )}

      <nav
        id="app-nav-drawer"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl transition-transform duration-200 ease-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
        aria-label="Menú de navegación"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <span className="truncate font-bold text-brand-primary">{title}</span>
          <button
            type="button"
            className="rounded-lg p-2 text-brand-primary hover:bg-gray-100"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <ul className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={mobileLinkClass(link.href)} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {backLink && (
          <div className="border-t border-gray-100 p-3">
            <Link
              href={backLink.href}
              className={mobileLinkClass(backLink.href)}
              onClick={() => setOpen(false)}
            >
              ← {backLink.label}
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
