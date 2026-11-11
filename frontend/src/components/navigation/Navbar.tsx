"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UserIcon } from "lucide-react";
import { useAuthContext } from "@/src/context/auth-context";

// No notification module yet, placeholder
const UNREAD_COUNT = 0;

const DESKTOP_LINKS = [
  { href: "/skateparks", label: "Skate Parks" },
  { href: "/streetspots", label: "Street Spots" },
  { href: "/skateshops", label: "Shops" },
  { href: "/news", label: "News" },
  { href: "/form", label: "Submit a spot" },
];

const MOBILE_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/skateparks", label: "SKATE PARKS" },
  { href: "/streetspots", label: "STREET SPOTS" },
  { href: "/skateshops", label: "SKATE SHOPS" },
  { href: "/news", label: "NEWS" },
  { href: "/form", label: "SUBMIT A SPOT" },
  { href: "/profile", label: "PROFILE" },
  { href: "/notifications", label: "NOTIFICATIONS" },
];

export default function Navbar() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLLIElement>(null);

  const pathname = usePathname();

  const { user, signOut } = useAuthContext();

  const isAdmin = user?.role === "ADMIN";
  const isHomePage = pathname === "/";
  const unreadCount = UNREAD_COUNT;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setMobileMenu(false);
    setAccountOpen(false);
  }, [pathname]);

  const menuItem =
    "block w-full rounded-sm px-2 py-1.5 text-left text-[16px] text-main-title-color hover:bg-[#2a2a2a]";

  return (
    <header
      className={`relative z-40 flex h-20 w-full items-center justify-between p-4 text-white ${
        isHomePage
          ? "bg-transparent"
          : "border-b border-[#2a2a2a] bg-main-background"
      }`}
    >
      <Link href="/">
        <Image
          src="/logo20.png"
          alt="logo"
          width={240}
          height={40}
          className="h-10 w-60"
          priority
        />
      </Link>

      <button
        onClick={() => setMobileMenu((prev) => !prev)}
        className="relative flex h-8 w-8 cursor-pointer flex-col items-center justify-center lg:hidden"
        aria-label="Toggle menu"
      >
        <span
          className={`absolute left-0 h-0.5 w-6 rounded-sm bg-white transition-all duration-300 ease-in-out ${
            mobileMenu ? "top-3 rotate-45" : "top-2"
          }`}
        />
        <span
          className={`absolute left-0 h-0.5 w-6 rounded-sm bg-white transition-all duration-300 ease-in-out ${
            mobileMenu ? "top-3 -rotate-45" : "top-6"
          }`}
        />
      </button>

      <ul className="hidden items-center gap-5 lg:flex">
        {DESKTOP_LINKS.map(({ href, label }) => (
          <li key={href} className="list-none">
            <Link
              href={href}
              className="link-corner-border block cursor-pointer px-2 py-1 text-[20px] text-main-title-color"
            >
              {label}
            </Link>
          </li>
        ))}

        <li ref={accountRef} className="relative list-none">
          <button
            onClick={() => setAccountOpen((prev) => !prev)}
            className="link-corner-border relative cursor-pointer p-1"
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            aria-label="Account menu"
          >
            <UserIcon className="text-main-title-color" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-black">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {accountOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-56 rounded-md border border-[#2a2a2a] bg-[#1a1a1a] p-1 shadow-lg"
            >
              <p className="px-2 py-1.5 text-[18px] text-secondary-title-color">
                My Account
              </p>
              <div className="my-1 h-px bg-[#2a2a2a]" />

              <Link href="/profile" className={menuItem}>
                Profile
              </Link>
              <Link href="/notifications" className={`${menuItem} flex`}>
                Notifications
                {unreadCount > 0 && (
                  <span className="px-1 text-[14px] text-brand">
                    ({unreadCount})
                  </span>
                )}
              </Link>

              {user ? (
                <button onClick={() => signOut()} className={menuItem}>
                  Logout
                </button>
              ) : (
                <Link href="/login" className={menuItem}>
                  Login
                </Link>
              )}

              {isAdmin && (
                <Link href="/admin-panel" className={menuItem}>
                  Admin panel
                </Link>
              )}
            </div>
          )}
        </li>
      </ul>

      <div
        className={`absolute left-1/2 top-20 z-50 w-full -translate-x-1/2 bg-black/60 p-4 backdrop-blur-sm transition-all duration-500 ease-in-out lg:hidden ${
          mobileMenu
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <ul className="flex flex-col items-center justify-center gap-5">
          {MOBILE_LINKS.map(({ href, label }) => (
            <li key={href} className="list-none">
              <Link
                href={href}
                className="link-corner-border block cursor-pointer px-2 py-1 text-[18px] text-white"
              >
                {label}
              </Link>
            </li>
          ))}

          <li className="list-none">
            {user ? (
              <button
                onClick={() => signOut()}
                className="link-corner-border block cursor-pointer px-2 py-1 text-[18px] text-white"
              >
                LOGOUT
              </button>
            ) : (
              <Link
                href="/login"
                className="link-corner-border block cursor-pointer px-2 py-1 text-[18px] text-white"
              >
                LOGIN
              </Link>
            )}
          </li>

          {isAdmin && (
            <li className="list-none">
              <Link
                href="/admin-panel"
                className="link-corner-border block cursor-pointer px-2 py-1 text-[18px] text-white"
              >
                Admin panel
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
