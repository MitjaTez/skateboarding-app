"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyEmail } from "../../../services/auth-service";

const card =
  "w-full max-w-md border border-[#2a2a2a] bg-[#1a1a1a] p-10 text-center";
const title = "mb-6 text-[24px] text-main-title-color";
const text = "mb-6 text-[16px] text-secondary-title-color";
const link = "ml-1 text-brand hover:underline";

function VerifyEmail() {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const { mutate, isSuccess, isError } = useVerifyEmail();
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    mutate(token);
  }, [token, mutate]);

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => router.push("/login"), 3000);
    return () => clearTimeout(timer);
  }, [isSuccess, router]);

  const failed = !token || isError;

  return (
    <div className="flex w-full items-center justify-center p-4 py-16">
      {!failed && !isSuccess && (
        <div className={card}>
          <h1 className={title}>Verifying your email...</h1>
          <p className="text-[16px] text-secondary-title-color">
            Please wait while we verify your email address.
          </p>
        </div>
      )}

      {isSuccess && (
        <div className={card}>
          <h1 className={title}>Email Verified!</h1>
          <p className={text}>
            Your account has been verified. Redirecting you to login...
          </p>
          <p className="text-secondary-title-color">
            Not redirected?
            <Link href="/login" className={link}>
              Click here
            </Link>
          </p>
        </div>
      )}

      {failed && (
        <div className={card}>
          <h1 className={title}>Verification Failed</h1>
          <p className={text}>
            This verification link is invalid or has expired.
          </p>
          <p className="text-secondary-title-color">
            Back to
            <Link href="/login" className={link}>
              Login
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
