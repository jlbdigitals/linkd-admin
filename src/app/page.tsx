"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Home() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine current theme
  const currentTheme = theme === 'system' ? systemTheme : theme;
  // White logo for light mode, black logo for dark mode
  const logoSrc = currentTheme === 'dark' ? '/logo.png' : '/logo-white.png';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 gap-6 relative overflow-hidden">
      <div className="z-10 flex flex-col items-center gap-6">
        {mounted ? (
          <Image
            src={logoSrc}
            alt="linkd-app logo"
            width={180}
            height={60}
            className="object-contain mb-8"
            priority
          />
        ) : (
          <div className="w-[180px] h-[60px] mb-8" />
        )}

        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-full bg-black text-white px-8 py-3 font-semibold hover:bg-zinc-800 transition-all shadow-lg hover:shadow-black/20"
          >
            Acceso Usuarios
          </Link>
        </div>
      </div>
    </div >
  );
}
