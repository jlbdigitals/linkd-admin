import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 gap-8">
      <h1 className="text-4xl font-bold tracking-tight">linkd-app</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Tu tarjeta de presentación sin contacto.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-full bg-foreground text-background px-6 py-2 font-medium hover:opacity-90 transition-opacity"
        >
          Iniciar Sesión
        </Link>
        <Link
          href="/register"
          className="rounded-full border border-gray-300 px-6 py-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Registrarse
        </Link>
      </div>
    </div>
  );
}
