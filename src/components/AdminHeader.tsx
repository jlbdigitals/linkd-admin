"use client";

import { ModeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { logout } from "@/app/authActions";

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
                        <Image src="/logo.png" alt="LINKD" width={80} height={30} className="h-7 w-auto" />
                    </Link>
                    {showBack && (
                        <nav className="flex items-center text-sm font-medium">
                            <Link href="/admin" className="transition-colors hover:text-foreground/80 text-foreground/60">
                                / Volver
                            </Link>
                        </nav>
                    )}
                </div>

                <div className="flex items-center space-x-2 justify-end">
                    <ModeToggle />
                    <form action={logout}>
                        <button type="submit" className="p-2 text-red-500 hover:text-red-600 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20" title="Cerrar Sesión">
                            <LogOut size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
}
