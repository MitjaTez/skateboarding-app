"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MdDelete,
  MdCheckCircle,
  MdVisibility,
  MdSearch,
} from "react-icons/md";
import { X } from "lucide-react";

import {
  useFetchAllStreetSpotsAdmin,
  useApproveStreetSpot,
  useDeclineStreetSpot,
  useFetchStreetSpotById,
  useDeleteStreetSpot,
} from "../../../services/street-service";
import { StreetSpot } from "@/src/services/types";
import Loader from "@/src/components/loader/Loader";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const normalizeStatus = (status: string): Exclude<StatusFilter, "ALL"> =>
  status === "APPROVED" || status === "REJECTED" ? status : "PENDING";

const STATUS_STYLES: Record<Exclude<StatusFilter, "ALL">, string> = {
  APPROVED: "bg-green-50 text-green-700 ring-green-600/20",
  REJECTED: "bg-red-50 text-red-700 ring-red-600/20",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

const STATUS_LABELS: Record<Exclude<StatusFilter, "ALL">, string> = {
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PENDING: "Pending",
};

function StatusBadge({ status }: { status: string }) {
  const key = normalizeStatus(status);
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[key]}`}
    >
      {STATUS_LABELS[key]}
    </span>
  );
}

type ActionHandlers = {
  onView: (id: number) => void;
  onApprove: (id: number) => void;
  onDecline: (id: number) => void;
  onDelete: (id: number) => void;
};

function SpotCard({
  spot,
  onView,
  onApprove,
  onDecline,
  onDelete,
}: { spot: StreetSpot } & ActionHandlers) {
  const status = normalizeStatus(spot.status);
  const cover = spot.images?.[0]?.url;

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-md">
      <button
        type="button"
        onClick={() => onView(spot.id)}
        aria-label={`View ${spot.name}`}
        className="relative block h-36 w-full bg-gray-100 text-left"
      >
        {cover ? (
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-gray-400">
            No photo
          </span>
        )}
        <span className="absolute left-3 top-3">
          <StatusBadge status={spot.status} />
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="truncate font-semibold text-gray-900">{spot.name}</h3>
        <p className="text-xs text-gray-500">Spot #{spot.id}</p>
      </div>

      <div className="flex items-center gap-2 border-t border-gray-100 p-3">
        <button
          type="button"
          onClick={() => onApprove(spot.id)}
          disabled={status === "APPROVED"}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MdCheckCircle className="text-base" />
          Approve
        </button>

        <button
          type="button"
          onClick={() => onDecline(spot.id)}
          disabled={status === "REJECTED"}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X className="h-4 w-4" />
          Decline
        </button>

        <button
          type="button"
          onClick={() => onView(spot.id)}
          title="View details"
          aria-label={`View ${spot.name}`}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
        >
          <MdVisibility className="text-lg" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(spot.id)}
          title="Delete spot"
          aria-label={`Delete ${spot.name}`}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-700"
        >
          <MdDelete className="text-lg" />
        </button>
      </div>
    </li>
  );
}

function SpotDrawer({
  spot,
  isLoading,
  onClose,
  onApprove,
  onDecline,
}: {
  spot: StreetSpot | undefined;
  isLoading: boolean;
  onClose: () => void;
  onApprove: (id: number) => void;
  onDecline: (id: number) => void;
}) {
  const status = spot ? normalizeStatus(spot.status) : undefined;

  const details = spot
    ? [
        { label: "Type", value: spot.spotType },
        { label: "Best time", value: spot.bestTimeType },
        { label: "Parking", value: spot.parkingType },
        { label: "Surface", value: spot.surfaceType },
      ]
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-stretch sm:justify-end"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="spot-drawer-title"
        className="flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:max-h-none sm:max-w-md sm:rounded-none"
      >
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="spot-drawer-title"
              className="truncate text-lg font-semibold text-gray-900"
            >
              {spot?.name ?? "Street spot"}
            </h2>
            {spot && (
              <div className="mt-1.5 flex items-center gap-2">
                <StatusBadge status={spot.status} />
                <span className="text-xs text-gray-500">Spot #{spot.id}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : !spot ? (
            <p className="py-8 text-center text-sm text-gray-500">
              This street spot could not be loaded.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {spot.description && (
                <p className="text-sm leading-relaxed text-gray-600">
                  {spot.description}
                </p>
              )}

              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl bg-gray-50 p-4">
                {details.map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <dt className="text-xs text-gray-500">{label}</dt>
                    <dd className="text-sm font-medium text-gray-800">
                      {value ?? "—"}
                    </dd>
                  </div>
                ))}
              </dl>

              {(spot.images?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-3">
                  {spot.images?.map((image, index) => (
                    <img
                      key={image.id ?? image.url}
                      src={image.url}
                      alt={`${spot.name} - photo ${index + 1}`}
                      loading="lazy"
                      className="h-52 w-full rounded-xl object-cover sm:h-60"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {spot && (
          <footer className="flex shrink-0 gap-2 border-t border-gray-100 px-5 py-4">
            <button
              type="button"
              onClick={() => {
                onDecline(spot.id);
                onClose();
              }}
              disabled={status === "REJECTED"}
              className="flex-1 rounded-xl bg-orange-50 py-2.5 text-sm font-medium text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Decline
            </button>

            <button
              type="button"
              onClick={() => {
                onApprove(spot.id);
                onClose();
              }}
              disabled={status === "APPROVED"}
              className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Approve
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}

export default function SpotManagement() {
  const [viewSpotId, setViewSpotId] = useState<number | undefined>();
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");

  const { data: spotsData, isLoading, isError } = useFetchAllStreetSpotsAdmin();

  const { data: viewSpot, isLoading: isLoadingSpot } =
    useFetchStreetSpotById(viewSpotId);

  const { mutate: approve } = useApproveStreetSpot();
  const { mutate: decline } = useDeclineStreetSpot();
  const { mutate: deleteStreet } = useDeleteStreetSpot();

  const spots: StreetSpot[] = useMemo(() => spotsData?.data ?? [], [spotsData]);

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      ALL: spots.length,
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
    };
    for (const spot of spots) result[normalizeStatus(spot.status)] += 1;
    return result;
  }, [spots]);

  const visibleSpots = useMemo(() => {
    const term = query.trim().toLowerCase();
    return spots.filter((spot) => {
      const matchesFilter =
        filter === "ALL" || normalizeStatus(spot.status) === filter;
      const matchesQuery =
        !term ||
        spot.name.toLowerCase().includes(term) ||
        String(spot.id).includes(term);
      return matchesFilter && matchesQuery;
    });
  }, [spots, filter, query]);

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this street spot? This can't be undone.")) {
      deleteStreet(id);
    }
  };

  const closeDrawer = () => setViewSpotId(undefined);

  useEffect(() => {
    if (viewSpotId === undefined) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setViewSpotId(undefined);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewSpotId]);

  if (isLoading) {
    return (
      <div className="flex w-full justify-center py-12">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load street spots. Please try again.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-900">
          Street spot management
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Review, approve or decline submitted street spots.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Filter by status"
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
          <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or ID"
            aria-label="Search street spots"
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {spots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-500">
          No street spots have been submitted yet.
        </div>
      ) : visibleSpots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-500">
          No spots match your filters.
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
          {visibleSpots.map((spot) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              onView={setViewSpotId}
              onApprove={approve}
              onDecline={decline}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      {viewSpotId !== undefined && (
        <SpotDrawer
          spot={viewSpot}
          isLoading={isLoadingSpot}
          onClose={closeDrawer}
          onApprove={approve}
          onDecline={decline}
        />
      )}
    </div>
  );
}
