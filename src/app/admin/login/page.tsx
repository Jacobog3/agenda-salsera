"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Contraseña incorrecta");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 overflow-hidden rounded-2xl shadow-md">
            <Image
              src="/images/exploraguate-icon.png"
              alt="ExploraGuate"
              width={112}
              height={112}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="font-display text-lg font-bold tracking-normal">
              <span className="text-brand-600">Salsa</span>
              <span className="mx-1 text-gray-300">·</span>
              <span className="text-gray-900">Explora</span>
              <span className="text-brand-600">Guate</span>
            </p>
            <p className="mt-0.5 text-sm text-gray-500">Panel de administración</p>
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-black/[0.04] bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
              <Lock className="h-4 w-4 text-brand-600" />
            </div>
            <h1 className="font-display text-base font-bold text-foreground">
              Acceso restringido
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="h-11"
            />

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <p className="text-xs font-medium text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || !password}
            >
              {loading ? "Verificando..." : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400">
          Solo para uso interno de ExploraGuate
        </p>
      </div>
    </div>
  );
}
