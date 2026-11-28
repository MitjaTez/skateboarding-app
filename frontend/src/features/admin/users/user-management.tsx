"use client";

import React, { useMemo, useState } from "react";
import { Ban, Search, Trash2, UserCheck } from "lucide-react";
import {
  useBlockUser,
  useDeleteUser,
  useFetchUsersAll,
} from "@/src/services/auth-service";
import { useAuthContext } from "@/src/context/auth-context";
import type { AdminUser } from "@/src/services/types";
import Loader from "@/src/components/loader/Loader";

type UserFilter = "ALL" | "ADMIN" | "USER" | "BLOCKED";

const FILTERS: { value: UserFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ADMIN", label: "Admins" },
  { value: "USER", label: "Users" },
  { value: "BLOCKED", label: "Blocked" },
];

const initialOf = (name?: string) => (name?.trim()?.[0] ?? "?").toUpperCase();

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "ADMIN";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        isAdmin
          ? "bg-purple-50 text-purple-700 ring-purple-600/20"
          : "bg-blue-50 text-blue-700 ring-blue-600/20"
      }`}
    >
      {isAdmin ? "Admin" : "User"}
    </span>
  );
}

function UserCard({
  user,
  isSelf,
  onBlock,
  onDelete,
}: {
  user: AdminUser;
  isSelf: boolean;
  onBlock: (id: number, isBlocked: boolean) => void;
  onDelete: (id: number) => void;
}) {
  const details = [
    { label: "Age", value: user.age },
    { label: "Hometown", value: user.hometown },
    { label: "Stance", value: user.stance },
  ];

  return (
    <li
      className={`flex flex-col overflow-hidden rounded-2xl border bg-white transition hover:shadow-md ${
        user.isBlocked
          ? "border-red-200"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Identity */}
      <div className="flex items-center gap-3 p-4">
        {user.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt=""
            loading="lazy"
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-semibold ${
              user.isBlocked
                ? "bg-red-50 text-red-700"
                : "bg-gray-900 text-white"
            }`}
          >
            {initialOf(user.username)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-gray-900">
              {user.username}
            </h3>
            {isSelf && (
              <span className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                You
              </span>
            )}
          </div>
          <p className="truncate text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4">
        <RoleBadge role={user.role} />
        {user.isBlocked && (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
            Blocked
          </span>
        )}
        <span className="ml-auto text-xs text-gray-400">#{user.id}</span>
      </div>

      <dl className="mx-4 mb-4 mt-3 grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-3">
        {details.map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="truncate text-sm font-medium text-gray-800">
              {value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2 border-t border-gray-100 p-3">
        <button
          type="button"
          onClick={() => onBlock(user.id, user.isBlocked)}
          disabled={isSelf}
          title={isSelf ? "You can't block yourself" : undefined}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
            user.isBlocked
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-orange-50 text-orange-700 hover:bg-orange-100"
          }`}
        >
          {user.isBlocked ? (
            <>
              <UserCheck className="h-4 w-4" />
              Unblock
            </>
          ) : (
            <>
              <Ban className="h-4 w-4" />
              Block
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => onDelete(user.id)}
          disabled={isSelf}
          title={isSelf ? "You can't delete yourself" : "Delete user"}
          aria-label={`Delete ${user.username}`}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500"
        >
          <Trash2 className="h-[18px] w-[18px]" />
        </button>
      </div>
    </li>
  );
}

const UserManagement: React.FC = () => {
  const { data: users, isLoading, isError } = useFetchUsersAll();
  const { user: currentUser } = useAuthContext();
  const { mutate: blockUser } = useBlockUser();
  const { mutate: deleteUser } = useDeleteUser();

  const [filter, setFilter] = useState<UserFilter>("ALL");
  const [query, setQuery] = useState("");

  const allUsers: AdminUser[] = useMemo(() => users ?? [], [users]);

  const counts = useMemo(
    () => ({
      ALL: allUsers.length,
      ADMIN: allUsers.filter((u) => u.role === "ADMIN").length,
      USER: allUsers.filter((u) => u.role !== "ADMIN").length,
      BLOCKED: allUsers.filter((u) => u.isBlocked).length,
    }),
    [allUsers],
  );

  const visibleUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    return allUsers.filter((u) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "ADMIN" && u.role === "ADMIN") ||
        (filter === "USER" && u.role !== "ADMIN") ||
        (filter === "BLOCKED" && u.isBlocked);

      const matchesQuery =
        !term ||
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.hometown?.toLowerCase().includes(term) ||
        String(u.id).includes(term);

      return matchesFilter && matchesQuery;
    });
  }, [allUsers, filter, query]);

  if (!currentUser || isLoading) {
    return (
      <div className="flex w-full justify-center py-12">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load users. Please try again.
      </div>
    );
  }

  const handleBlockUser = (userId: number, isBlocked: boolean) => {
    if (userId === currentUser.id) return;
    blockUser({ userId, action: isBlocked ? "unblock" : "block" });
  };

  const handleDeleteUser = (id: number) => {
    if (id === currentUser.id) return;
    if (window.confirm("Delete this user? This can't be undone.")) {
      deleteUser(id);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-900">User management</h2>
        <p className="mt-1 text-sm text-gray-500">
          Block, unblock or remove registered users.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Filter users"
          className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1"
        >
          {FILTERS.map(({ value, label }) => {
            const active = filter === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(value)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {label}
                <span className="text-xs text-gray-400">{counts[value]}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email or town"
            aria-label="Search users"
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {allUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-500">
          No users found.
        </div>
      ) : visibleUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-500">
          No users match your filters.
          <button
            type="button"
            onClick={() => {
              setFilter("ALL");
              setQuery("");
            }}
            className="ml-1 font-medium text-gray-900 underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isSelf={user.id === currentUser.id}
              onBlock={handleBlockUser}
              onDelete={handleDeleteUser}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserManagement;
