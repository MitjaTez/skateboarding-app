"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { useAuthContext } from "../../context/auth-context";
import EditProfile from "../../components/profile/EditProfile";
import ConfirmModal from "../../components/profile/ConfirmModal";

type MainTab = "favorites" | "videos";
type FavTab = "skateparks" | "streetspots";

export default function ProfilePage() {
  const { user, isLoading, deleteProfile } = useAuthContext();
  const [mainTab, setMainTab] = useState<MainTab>("favorites");
  const [favTab, setFavTab] = useState<FavTab>("streetspots");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (isLoading) {
    return <p className="mt-24 text-center text-white/40">Loading...</p>;
  }

  if (!user) {
    return (
      <div className="mt-24 text-center">
        <p className="mb-4 text-white/60">Please log in to see your profile</p>
        <Link
          href="/login"
          className="rounded-xl bg-brand px-4 py-2 font-semibold text-black"
        >
          Go to login
        </Link>
      </div>
    );
  }

  const avatar =
    !imageError && user.profileImage
      ? user.profileImage
      : "/avatar-default.jpg";

  return (
    <div className="mx-auto mt-16 flex w-full max-w-xl flex-col items-center px-4 pb-16">
      {/* Avatar + settings */}
      <div className="relative flex w-full justify-center">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt={user.username}
            onError={() => setImageError(true)}
            className="h-28 w-28 rounded-full border-2 border-white/10 object-cover shadow-xl md:h-32 md:w-32"
          />
          <div className="absolute inset-0 rounded-full ring-2 ring-brand/30" />
        </div>

        <div ref={settingsRef} className="absolute bottom-0 right-0">
          <button
            onClick={() => setSettingsOpen((p) => !p)}
            aria-label="Settings"
            className="cursor-pointer rounded-full border border-white/10 bg-[#1a1a1a] p-2 text-white/50 transition-colors hover:text-white"
          >
            <Settings className="h-5 w-5" />
          </button>

          {settingsOpen && (
            <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] shadow-xl">
              <button
                onClick={() => {
                  setIsEditOpen(true);
                  setSettingsOpen(false);
                }}
                className="w-full cursor-pointer px-4 py-3 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                Edit Profile
              </button>
              <div className="border-t border-white/10" />
              <button
                onClick={() => {
                  setIsDeleteOpen(true);
                  setSettingsOpen(false);
                }}
                className="w-full cursor-pointer px-4 py-3 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
              >
                Delete Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <EditProfile open={isEditOpen} setOpen={setIsEditOpen} />

      <h1 className="mt-5 text-2xl font-black uppercase tracking-tight text-main-title-color md:text-3xl">
        {user.username}
      </h1>

      {/* Stats */}
      <div className="mt-4 flex gap-6 text-center">
        {[
          { label: "Age", value: user.age },
          { label: "Hometown", value: user.hometown },
          { label: "Stance", value: user.stance },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-2.5"
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
              {label}
            </span>
            <span className="text-sm font-medium text-main-title-color">
              {value ?? "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Main tabs */}
      <div className="mt-6 flex w-full items-center gap-1 rounded-xl border border-white/10 bg-[#1a1a1a] p-1">
        {(["favorites", "videos"] as MainTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setMainTab(tab)}
            className={`flex-1 cursor-pointer rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
              mainTab === tab
                ? "bg-brand text-black"
                : "text-white/45 hover:text-white/70"
            }`}
          >
            {tab === "favorites" ? "My Favorites" : "Videos"}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div className="mt-3 w-full rounded-2xl border border-white/10 bg-[#1a1a1a] p-4">
        {mainTab === "favorites" ? (
          <>
            <div className="mb-4 flex w-fit gap-1 rounded-lg border border-white/10 bg-[#0f0f0f] p-1">
              {(["skateparks", "streetspots"] as FavTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFavTab(tab)}
                  className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    favTab === tab
                      ? "border border-brand/25 bg-brand/15 text-brand"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {tab === "skateparks" ? "Parks" : "Street"}
                </button>
              ))}
            </div>

            {/* TODO: render the favorites grid once the favorites endpoints are wired */}
            <p className="flex h-48 items-center justify-center text-sm text-white/25">
              Nothing here yet
            </p>
          </>
        ) : (
          <p className="flex h-48 items-center justify-center text-sm text-white/25">
            No videos yet
          </p>
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={deleteProfile}
        title="Delete Profile"
        message="Are you sure you want to delete your profile? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
