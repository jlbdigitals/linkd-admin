"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-200">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <Image src="/logo.png" alt="LINKD" width={120} height={45} className="h-12 w-auto" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Acceso Administrativo</h1>
                    <p className="text-muted-foreground mt-2">
                        {step === "email"
                            ? "Ingresa tu correo para recibir un código de acceso."
                            : isMaster
                                ? "Ingresa tu contraseña maestra por favor."
                                : `Hemos enviado un código a ${email}`}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-100">
                        {error}
                    </div>
                )}

                {step === "email" ? (
                    <form action={handleRequestCode} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 block">Correo Electrónico</label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="tu@empresa.com"
                                className="w-full border p-2.5 rounded-lg bg-white border-gray-300 text-black text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            />
                        </div>
                        <SubmitButton label="Enviar Código" />
                    </form>
                ) : (
                    <form action={handleVerifyCode} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 block">
                                {isMaster ? "Contraseña" : "Código de Verificación"}
                            </label>
                            <input
                                type={isMaster ? "password" : "text"}
                                name="code"
                                required
                                defaultValue={debugCode}
                                placeholder={isMaster ? "••••••••" : "123456"}
                                className={`w-full border p-2.5 rounded-lg bg-white border-gray-300 text-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none ${!isMaster ? 'font-mono text-center text-xl tracking-widest' : 'text-base'}`}
                                maxLength={isMaster ? 32 : 6}
                            />
                        </div>
                        <SubmitButton label="Validar y Entrar" />
                        <button
                            type="button"
                            onClick={() => setStep("email")}
                            className="w-full text-sm text-gray-500 hover:text-gray-800 underline mt-2 transition-colors"
                        >
                            Cambiar correo electrónico
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
