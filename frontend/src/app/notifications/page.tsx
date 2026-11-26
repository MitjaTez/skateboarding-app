"use client";

import Link from "next/link";
import { useAuthContext } from "../../context/auth-context";

export default function NotificationsPage() {
  const { user, isLoading } = useAuthContext();

  if (isLoading) return null;

  if (!user) {
    return (
      <div className="mt-24 text-center">
        <p className="mb-4 text-white/60">Please login to see notifications</p>
        <Link
          href="/login"
          className="rounded-xl bg-brand px-4 py-2 font-semibold text-black"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-2 pt-12">
      <div className="w-full max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-white">Notifications</h1>
        {/* TODO: list notifications once the notification module exists */}
        <div className="py-10 text-center text-white/40">
          No notifications yet
        </div>
      </div>
    </div>
  );
}
