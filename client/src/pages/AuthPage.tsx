import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/Button";

type AuthForm = {
  username: string;
  password: string;
};

export function AuthPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const { register, handleSubmit, formState } = useForm<AuthForm>();

  if (user) {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/"} replace />;
  }

  async function onSubmit(values: AuthForm) {
    setError("");
    try {
      const response = mode === "login" ? await api.login(values) : await api.register(values);
      setUser(response.user);
      navigate(response.user.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не получилось войти.");
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-90px)] w-full max-w-6xl items-center gap-8 overflow-hidden px-4 pb-12 pt-4 sm:gap-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="min-w-0">
        <img src="/logo.png" alt="Meeting Market" className="mb-6 h-24 w-24 rounded-full object-cover shadow-soft ring-1 ring-gold/50 sm:mb-8 sm:h-28 sm:w-28" />
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-gold">Meeting Market</p>
        <h1 className="max-w-2xl break-words text-3xl font-bold leading-tight text-cream sm:text-6xl">
          Рынок встреч с Ильей открыт по предварительной записи.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-cream/68">
          Спонтанность прекрасна, но календарь суров. Входите, выбирайте свободный слот и отправляйте заявку на аудиенцию.
        </p>
      </section>

      <section className="min-w-0 rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-soft backdrop-blur sm:p-7">
        <div className="mb-6 grid grid-cols-2 rounded-lg bg-black/20 p-1">
          <button
            className={`rounded-md px-2 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-gold text-ink" : "text-cream/65"}`}
            onClick={() => setMode("login")}
          >
            Вход
          </button>
          <button
            className={`rounded-md px-2 py-2 text-sm font-semibold transition ${mode === "register" ? "bg-gold text-ink" : "text-cream/65"}`}
            onClick={() => setMode("register")}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-cream/70">Ник</span>
            <input
              className="field"
              autoComplete="username"
              {...register("username", { required: true, minLength: 2 })}
              placeholder="например, market_guest"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-cream/70">Пароль</span>
            <input
              className="field"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              {...register("password", { required: true, minLength: 6 })}
              placeholder="минимум 6 символов"
            />
          </label>
          {error ? <p className="rounded-lg bg-ember/12 px-3 py-2 text-sm text-[#ffc1b8]">{error}</p> : null}
          <Button className="w-full" disabled={formState.isSubmitting}>
            {mode === "login" ? "Войти" : "Создать аккаунт"}
          </Button>
        </form>
      </section>
    </main>
  );
}
