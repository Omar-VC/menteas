import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Mail, Lock, User as UserIcon } from "lucide-react";

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await register(email, password);
      } else {
        await login(email, password);
      }
      onLogin();
    } catch (err: any) {
      setError(err.message || "Error al autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded bg-primary flex items-center justify-center text-white font-bold mx-auto mb-3">
            <UserIcon size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Menteas</h2>
          <p className="text-slate-400">
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-900/20 border border-red-900/30 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Correo electrónico</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                type="email"
                autoComplete="username"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Contraseña</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? mode === "register"
                ? "Creando cuenta..."
                : "Entrando..."
              : mode === "register"
                ? "Crear cuenta"
                : "Ingresar"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="w-full text-sm text-slate-400 hover:text-primary transition-colors py-2"
        >
          {mode === "login"
            ? "¿No tenés cuenta? Crear una"
            : "Ya tenés cuenta? Iniciar sesión"}
        </button>
        <p className="mt-4 text-center text-xs text-slate-500">
          La contraseña se guarda de forma segura en Firebase Auth.
        </p>
      </Card>
    </div>
  );
}