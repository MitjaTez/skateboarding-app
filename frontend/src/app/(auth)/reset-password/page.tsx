"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthContext } from "../../../context/auth-context";

// Limits match the backend ResetPasswordDto
const validator = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(72, "Password is too long."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

type FormFields = z.infer<typeof validator>;

const card = "w-full max-w-md border border-[#2a2a2a] bg-[#1a1a1a] p-10";
const input =
  "w-full rounded border border-[#2a2a2a] bg-[#0f0f0f] px-3 py-2 text-main-title-color placeholder:text-secondary-dark-color focus:outline-none focus:ring-2 focus:ring-brand";
const label = "mb-2 block text-[16px] text-secondary-title-color";
const error = "mt-1 text-[16px] text-red-500";

function ResetPassword() {
  const { resetPassword } = useAuthContext();
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ resolver: zodResolver(validator) });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    if (!token) return;
    try {
      await resetPassword({ ...data, resetToken: token });
      setDone(true);
    } catch {
      // the provider already showed an error toast (e.g. expired link)
    }
  };

  if (!token) {
    return (
      <div className={`${card} text-center`}>
        <h1 className="mb-6 text-[24px] text-main-title-color">Invalid link</h1>
        <p className="mb-6 text-[16px] text-secondary-title-color">
          This reset link is missing its token. Request a new one.
        </p>
        <Link href="/reset" className="text-brand hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className={`${card} text-center`}>
        <h1 className="mb-6 text-[28px] text-main-title-color">
          Password Changed Successfully!
        </h1>
        <button
          onClick={() => router.push("/login")}
          className="w-full cursor-pointer rounded bg-brand px-4 py-2 font-bold text-black transition hover:opacity-90"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={card}>
      <h1 className="mb-8 text-center text-[32px] text-main-title-color">
        Change Password
      </h1>

      <div className="mb-5">
        <label className={label}>New Password</label>
        <input
          {...register("newPassword")}
          type="password"
          placeholder="Enter new password"
          className={input}
        />
        {errors.newPassword && (
          <p className={error}>{errors.newPassword.message}</p>
        )}
      </div>

      <div className="mb-5">
        <label className={label}>Confirm New Password</label>
        <input
          {...register("confirmPassword")}
          type="password"
          placeholder="Confirm password"
          className={input}
        />
        {errors.confirmPassword && (
          <p className={error}>{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full cursor-pointer rounded bg-brand px-4 py-2 font-bold text-black transition hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </button>

      <p className="mt-6 text-center text-secondary-title-color">
        Remembered your password?
        <Link href="/login" className="ml-1 text-brand hover:underline">
          Login here
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  // useSearchParams needs a Suspense boundary in the App Router
  return (
    <div className="flex w-full items-center justify-center p-4 py-16">
      <Suspense>
        <ResetPassword />
      </Suspense>
    </div>
  );
}
