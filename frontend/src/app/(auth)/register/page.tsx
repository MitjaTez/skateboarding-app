"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthContext } from "../../../context/auth-context";

const validator = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username is too long"),
  email: z.email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(72, "Password is too long"),
  age: z
    .number({ message: "Age is required" })
    .int("Age must be a whole number")
    .min(5, "Age must be at least 5")
    .max(120, "Age must be at most 120"),
  hometown: z
    .string()
    .min(1, "Hometown is required")
    .max(100, "Hometown is too long"),
  stance: z.enum(["REGULAR", "GOOFY"]),
});

type FormFields = z.infer<typeof validator>;

const input =
  "w-full rounded border border-[#2a2a2a] bg-[#0f0f0f] px-3 py-2 text-main-title-color placeholder:text-secondary-dark-color focus:outline-none focus:ring-2 focus:ring-brand";
const label = "mb-2 block text-[16px] text-secondary-title-color";
const error = "mt-1 text-[16px] text-red-500";

export default function RegisterPage() {
  const { signUp } = useAuthContext();
  const [registered, setRegistered] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(validator),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      age: 18,
      hometown: "",
      stance: "REGULAR",
    },
  });

  const stance = watch("stance");

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      await signUp(data);
      setRegistered(true);
    } catch {}
  };

  if (registered) {
    return (
      <div className="flex w-full items-center justify-center p-4 py-16">
        <div className="w-full max-w-md border border-[#2a2a2a] bg-[#1a1a1a] p-10 text-center">
          <h1 className="mb-6 text-[32px] text-main-title-color">
            Check your email!
          </h1>
          <p className="mb-6 text-[16px] text-secondary-title-color">
            We sent a verification link to your email address. Please click it
            to activate your account.
          </p>
          <p className="text-secondary-title-color">
            Already verified?
            <Link href="/login" className="ml-1 text-brand hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center p-4 py-12">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md border border-[#2a2a2a] bg-[#1a1a1a] p-10 rounded-md"
      >
        <h1 className="mb-8 text-center text-[32px] text-main-title-color">
          Register
        </h1>

        <div className="mb-5">
          <label className={label}>Username</label>
          <input
            {...register("username")}
            type="text"
            placeholder="Enter your username"
            className={input}
          />
          {errors.username && (
            <p className={error}>{errors.username.message}</p>
          )}
        </div>

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
          <label className={label}>Age</label>
          <input
            {...register("age", { valueAsNumber: true })}
            type="number"
            placeholder="Enter your age"
            className={input}
          />
          {errors.age && <p className={error}>{errors.age.message}</p>}
        </div>

        <div className="mb-5">
          <label className={label}>Hometown</label>
          <input
            {...register("hometown")}
            type="text"
            placeholder="Enter your hometown"
            className={input}
          />
          {errors.hometown && (
            <p className={error}>{errors.hometown.message}</p>
          )}
        </div>

        <div className="mb-5">
          <label className={label}>Stance</label>
          <div className="flex gap-2">
            {(["REGULAR", "GOOFY"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setValue("stance", option, { shouldValidate: true })
                }
                className={`flex-1 cursor-pointer rounded border px-3 py-2 transition ${
                  stance === option
                    ? "border-brand bg-brand text-black"
                    : "border-[#2a2a2a] text-main-title-color hover:border-secondary-title-color"
                }`}
              >
                {option === "REGULAR" ? "Regular" : "Goofy"}
              </button>
            ))}
          </div>
          {errors.stance && <p className={error}>{errors.stance.message}</p>}
        </div>

        <div className="mb-6">
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded bg-brand px-4 py-2 font-bold text-black transition duration-300 hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Loading..." : "Register"}
        </button>

        <p className="mt-6 text-center text-secondary-title-color">
          Already have an account?
          <Link href="/login" className="ml-1 text-brand hover:underline">
            Login here
          </Link>
        </p>
        <p className="mt-2 text-center text-secondary-title-color">
          Forgot password?
          <Link href="/reset" className="ml-1 text-brand hover:underline">
            Reset here
          </Link>
        </p>
      </form>
    </div>
  );
}
