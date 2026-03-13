"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold tracking-tight text-foreground">
            Acceso admin
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresa la contraseña para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
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
    </div>
  );
}
