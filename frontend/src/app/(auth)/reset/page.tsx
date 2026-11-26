"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthContext } from "../../../context/auth-context";

const validator = z.object({
  email: z.email("Invalid email"),
});

type FormFields = z.infer<typeof validator>;

const card = "w-full max-w-md border border-[#2a2a2a] bg-[#1a1a1a] p-10";
const input =
  "w-full rounded border border-[#2a2a2a] bg-[#0f0f0f] px-3 py-2 text-main-title-color placeholder:text-secondary-dark-color focus:outline-none focus:ring-2 focus:ring-brand";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuthContext();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(validator),
    defaultValues: { email: "" },
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      await forgotPassword(data);
      setSubmitted(true);
    } catch {
      // the provider already showed an error toast
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-4 py-16">
      {!submitted ? (
        <form onSubmit={handleSubmit(onSubmit)} className={card}>
          <h1 className="mb-8 text-center text-[32px] text-main-title-color">
            Reset Password
          </h1>
          <p className="mb-6 text-center text-[14px] text-secondary-title-color">
            Enter your email address below and we&apos;ll send you a link to
            reset your password.
          </p>

          <div className="mb-6">
            <label className="mb-2 block text-[16px] text-secondary-title-color">
              Email Address
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="Enter your email"
              className={input}
            />
            {errors.email && (
              <p className="mt-1 text-[16px] text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer rounded bg-brand px-4 py-2 font-bold text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Loading..." : "Send Reset Link"}
          </button>

          <p className="mt-6 text-center text-secondary-title-color">
            Remembered your password?
            <Link href="/login" className="ml-1 text-brand hover:underline">
              Login here
            </Link>
          </p>
        </form>
      ) : (
        <div className={`${card} text-center`}>
          <h1 className="mb-6 text-[24px] text-main-title-color">
            Check Your Email
          </h1>
          <p className="text-[16px] text-secondary-title-color">
            If an account with that email exists, a reset link has been sent.
          </p>
        </div>
      )}
    </div>
  );
}
