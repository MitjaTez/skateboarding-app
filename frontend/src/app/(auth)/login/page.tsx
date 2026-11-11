"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthContext } from "../../../context/auth-context";

const validator = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

type FormFields = z.infer<typeof validator>;

const REMEMBER_KEY = "rememberedEmail";

const input =
  "w-full rounded-xl border border-secondary-dark-color/40 bg-main-background px-3 py-2 text-main-title-color focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40";
const label = "mb-2 block text-[16px] text-secondary-title-color";
const error = "mt-1 text-[16px] text-red-400";

export default function LoginPage() {
  const { login } = useAuthContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormFields>({
    resolver: zodResolver(validator),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  useEffect(() => {
    try {
      const remembered = localStorage.getItem(REMEMBER_KEY) ?? "";
      if (remembered)
        reset({ email: remembered, password: "", rememberMe: true });
    } catch {}
  }, [reset]);

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      if (data.rememberMe) localStorage.setItem(REMEMBER_KEY, data.email);
      else localStorage.removeItem(REMEMBER_KEY);
    } catch {}

    try {
      await login({ email: data.email, password: data.password });
    } catch {}
  };

  return (
    <div className="flex w-full items-center justify-center p-4 py-12">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-2xl border border-brand/15 bg-main-dark-color/80 p-10 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      >
        <h1 className="mb-8 text-center text-[32px] text-main-title-color">
          Login
        </h1>

        <div className="mb-5">
          <label className={label}>Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="Enter your email"
            className={input}
          />
          {errors.email && <p className={error}>{errors.email.message}</p>}
        </div>

        <div className="mb-5">
          <label className={label}>Password</label>
          <input
            {...register("password")}
            type="password"
            placeholder="Enter your password"
            className={input}
          />
          {errors.password && (
            <p className={error}>{errors.password.message}</p>
          )}
        </div>

        <div className="mb-6 flex items-center justify-between">
          <label className="flex items-center gap-2 text-secondary-title-color">
            <input
              {...register("rememberMe")}
              type="checkbox"
              className="accent-[#e8ff47]"
            />
            Remember me
          </label>

          <Link
            href="/reset"
            className="text-secondary-title-color transition hover:text-brand"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-xl bg-brand px-4 py-2 font-semibold text-black transition-all duration-300 hover:shadow-[0_0_25px_rgba(232,255,71,0.25)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Loading..." : "Log in"}
        </button>

        <p className="mt-6 text-center text-secondary-title-color">
          Don&apos;t have an account?
          <Link href="/register" className="ml-1 text-brand hover:underline">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}
