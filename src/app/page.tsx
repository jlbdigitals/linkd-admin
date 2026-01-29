import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 gap-6 relative overflow-hidden">
      {/* Background blobs or style if needed can stay in CSS or be added here, 
          but per the image provided, the main content is centered. */}

      <div className="z-10 flex flex-col items-center gap-6">
        <Image
          src="/logo.png"
          alt="linkd-app logo"
          width={180}
          height={60}
          className="object-contain mb-8"
        />

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
