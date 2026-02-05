"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { useTheme } from "next-themes";
import { requestLoginCode, verifyLoginCode } from "../authActions";
import { Button } from "@/components/ui/button";

function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Procesando..." : label}
        </Button>
    );
}

export default function LoginPage() {
    const [step, setStep] = useState<"email" | "code">("email");
    const [isMaster, setIsMaster] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [debugCode, setDebugCode] = useState<string>("");
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

    async function handleRequestCode(formData: FormData) {
        setError(null);
        const res = await requestLoginCode(formData);
        if (res?.error) {
            setError(res.error);
        } else if (res?.success) {
            setEmail(res.email);
            setIsMaster(!!res.isMaster);
            if (res.debugCode) setDebugCode(res.debugCode);
            setStep("code");
        }
    }

    async function handleVerifyCode(formData: FormData) {
        setError(null);
        // We need to inject the email into the formData since it's not in the form input for step 2
        formData.append("email", email);
        const res = await verifyLoginCode(null, formData);
        if (res?.error) {
            setError(res.error);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-card p-8 rounded-xl shadow-xl w-full max-w-md border border-border">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        {mounted ? (
                            <Image
                                src={logoSrc}
                                alt="LINKD"
                                width={120}
                                height={45}
                                className="h-12 w-auto"
                                priority
                            />
                        ) : (
                            <div className="h-12 w-[120px]" />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Acceso Administrativo</h1>
                    <p className="text-muted-foreground mt-2">
                        {step === "email"
                            ? "Ingresa tu correo para recibir un código de acceso."
                            : isMaster
                                ? "Ingresa tu contraseña maestra por favor."
                                : `Hemos enviado un código a ${email}`}
                    </p>
                </div>

                {error && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-6 text-sm text-center border border-destructive/20 font-medium">
                        {error}
                    </div>
                )}

                {step === "email" ? (
                    <form action={handleRequestCode} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground block">Correo Electrónico</label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="tu@empresa.com"
                                className="w-full border p-2.5 rounded-lg bg-background border-input text-foreground text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            />
                        </div>
                        <SubmitButton label="Enviar Código" />
                    </form>
                ) : (
                    <form action={handleVerifyCode} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground block">
                                {isMaster ? "Contraseña" : "Código de Verificación"}
                            </label>
                            <input
                                type={isMaster ? "password" : "text"}
                                name="code"
                                required
                                defaultValue={debugCode}
                                placeholder={isMaster ? "••••••••" : "123456"}
                                className={`w-full border p-2.5 rounded-lg bg-background border-input text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${!isMaster ? 'font-mono text-center text-xl tracking-widest' : 'text-base'}`}
                                maxLength={isMaster ? 32 : 6}
                            />
                        </div>
                        <SubmitButton label="Validar y Entrar" />
                        <button
                            type="button"
                            onClick={() => setStep("email")}
                            className="w-full text-sm text-muted-foreground hover:text-foreground underline mt-2 transition-colors"
                        >
                            Cambiar correo electrónico
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
