"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { logout } from "@/app/authActions";
import { ThemeToggle } from "./ThemeToggle";

export function AdminHeader() {
    const pathname = usePathname();

    // Simple check to identify active section
    const isCompanyList = pathname === "/admin";
    const showBack = !isCompanyList;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-4 justify-between">
                <div className="mr-4 flex">
                    <Link className="mr-4 md:mr-6 flex items-center space-x-2" href="/admin">
                        <Image src="/logo.png" alt="LINKD" width={80} height={30} className="h-7 w-auto dark:invert" />
                    </Link>
                    {showBack && (
                        <nav className="flex items-center text-sm font-medium">
                            <Link href="/admin" className="transition-colors hover:text-foreground/80 text-foreground/60">
                                / Volver
                            </Link>
                        </nav>
                    )}
                </div>

                <div className="flex items-center space-x-4 justify-end">
                    <ThemeToggle />
                    <form action={logout}>
                        <button type="submit" className="p-2 text-destructive hover:text-destructive/80 rounded-full hover:bg-destructive/10 transition-colors" title="Cerrar Sesión">
                            <LogOut size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
}
