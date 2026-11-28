"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Dropzone from "react-dropzone";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthContext } from "../../context/auth-context";
import { useCreateStreetSpot } from "../../services/street-service";
import type { Coords } from "../../../src/components/street-spots/StreetMap";
import {
  bestTimeOptions,
  parkingOptions,
  pedestriansOptions,
  spotTypeOptions,
  surfaceOptions,
} from "../../lib/street-options";

const StreetMap = dynamic(
  () => import("../../../src/components/street-spots/StreetMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[450px] items-center justify-center text-white/40">
        Loading map...
      </div>
    ),
  },
);

// Limits and values match the backend StreetDto
const validator = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  spotType: z.enum(spotTypeOptions, { message: "Type is required" }),
  bestTimeType: z.enum(bestTimeOptions, { message: "Best time is required" }),
  parkingType: z.enum(parkingOptions, {
    message: "Parking option is required",
  }),
  surfaceType: z.enum(surfaceOptions, {
    message: "Surface condition is required",
  }),
  pedestriansType: z.enum(pedestriansOptions, {
    message: "Pedestrian info is required",
  }),
  description: z.string().max(2000, "Description is too long").optional(),
});

type FormFields = z.infer<typeof validator>;

const MAX_FILES = 4;
const MAX_BYTES = 5 * 1024 * 1024;

function PillGroup({
  options,
  value,
  onChange,
  error,
}: {
  options: readonly string[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-all duration-150 ${
              value === option
                ? "border-brand bg-brand font-semibold text-black"
                : "border-white/10 bg-white/5 text-secondary-title-color hover:border-brand/40 hover:text-brand"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-widest text-white/30">
        {children}
      </span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

const fieldLabel = "mb-1 block text-sm text-secondary-title-color";
const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-main-title-color placeholder:text-white/20 focus:border-brand/40 focus:outline-none transition-colors";

export default function StreetSpotFormPage() {
  const { user, isLoading } = useAuthContext();
  const { mutateAsync: createSpot, isPending } = useCreateStreetSpot();
  const [files, setFiles] = useState<File[]>([]);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [mapError, setMapError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormFields>({ resolver: zodResolver(validator) });

  // Preview URLs created once per file list, and freed when it changes
  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );
  useEffect(
    () => () => previews.forEach((url) => URL.revokeObjectURL(url)),
    [previews],
  );

  const pick = (field: keyof FormFields) => (value: string) =>
    setValue(field, value as never, { shouldValidate: true });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    if (!coords) {
      setMapError("Please select a location on the map");
      return;
    }
    try {
      await createSpot({
        ...data,
        latitude: coords.lat,
        longitude: coords.lng,
        images: files,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // the hook already showed an error toast
    }
  };

  const addAnother = () => {
    setSubmitted(false);
    reset();
    setFiles([]);
    setCoords(null);
    setMapError("");
  };

  if (isLoading) return null;

  if (!user) {
    return (
      <div className="mt-24 text-center">
        <p className="mb-4 text-white/60">Please log in to submit a spot</p>
        <Link
          href="/login"
          className="rounded-xl bg-brand px-4 py-2 font-semibold text-black"
        >
          Go to login
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center px-4 py-16">
        <div className="flex w-full max-w-lg flex-col items-center gap-6 rounded-2xl border border-white/10 bg-[#1a1a1a] p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/25 bg-brand/10 text-2xl">
            🛹
          </div>
          <div>
            <h1 className="mb-2 text-[32px] text-main-title-color">
              Thank you for contributing!
            </h1>
            <p className="text-secondary-title-color">
              We&apos;ll review your request within 24 hours
            </p>
          </div>
          <div className="flex w-full flex-col gap-3">
            <button
              onClick={addAnother}
              className="w-full cursor-pointer rounded-xl bg-brand py-3 text-sm font-semibold text-black transition-opacity hover:opacity-80"
            >
              Add Another Spot
            </button>
            <Link
              href="/streetspots"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-secondary-title-color transition-all hover:border-white/20 hover:text-main-title-color"
            >
              Discover more spots
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-3 pb-16 pt-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full max-w-2xl flex-col gap-6 rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 md:p-8"
      >
        <div className="pb-2 text-center">
          <h1 className="text-[24px] text-main-title-color">
            Add a street spot
          </h1>
          <p className="mt-1 text-sm text-secondary-title-color">
            Fill in the details below. We&apos;ll review within 24 hours
          </p>
        </div>

        <div>
          <SectionLabel>Basics</SectionLabel>
          <div className="flex flex-col gap-4">
            <div>
              <label className={fieldLabel}>Name</label>
              <input
                {...register("name")}
                placeholder="e.g. City Hall Ledge"
                className={inputCls}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className={fieldLabel}>Type</label>
              <PillGroup
                options={spotTypeOptions}
                value={watch("spotType")}
                onChange={pick("spotType")}
                error={errors.spotType?.message}
              />
            </div>
          </div>
        </div>

        <div>
          <SectionLabel>Conditions</SectionLabel>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <label className={fieldLabel}>Surface</label>
              <PillGroup
                options={surfaceOptions}
                value={watch("surfaceType")}
                onChange={pick("surfaceType")}
                error={errors.surfaceType?.message}
              />
            </div>
            <div>
              <label className={fieldLabel}>Pedestrians</label>
              <PillGroup
                options={pedestriansOptions}
                value={watch("pedestriansType")}
                onChange={pick("pedestriansType")}
                error={errors.pedestriansType?.message}
              />
            </div>
            <div>
              <label className={fieldLabel}>Parking</label>
              <PillGroup
                options={parkingOptions}
                value={watch("parkingType")}
                onChange={pick("parkingType")}
                error={errors.parkingType?.message}
              />
            </div>
            <div>
              <label className={fieldLabel}>Best time to skate</label>
              <PillGroup
                options={bestTimeOptions}
                value={watch("bestTimeType")}
                onChange={pick("bestTimeType")}
                error={errors.bestTimeType?.message}
              />
            </div>
          </div>
        </div>

        <div>
          <SectionLabel>Details</SectionLabel>
          <div className="flex flex-col gap-4">
            <div>
              <label className={fieldLabel}>
                Description{" "}
                <span className="text-xs text-white/20">(optional)</span>
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Tell us more about the spot..."
                className={`${inputCls} resize-none`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className={fieldLabel}>
                Photos{" "}
                <span className="text-xs text-white/20">
                  (max {MAX_FILES}, 5 MB each)
                </span>
              </label>

              {files.length < MAX_FILES ? (
                <Dropzone
                  onDrop={(incoming) =>
                    setFiles((prev) =>
                      [...prev, ...incoming].slice(0, MAX_FILES),
                    )
                  }
                  accept={{
                    "image/jpeg": [],
                    "image/png": [],
                    "image/webp": [],
                  }}
                  maxSize={MAX_BYTES}
                  maxFiles={MAX_FILES - files.length}
                >
                  {({ getRootProps, getInputProps, isDragActive }) => (
                    <div
                      {...getRootProps()}
                      className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 transition-all ${
                        isDragActive
                          ? "border-brand/60 bg-brand/10"
                          : "border-white/10 hover:border-brand/30 hover:bg-white/[0.03]"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <span className="text-center text-xs text-white/30">
                        Drag & drop or click to upload
                      </span>
                    </div>
                  )}
                </Dropzone>
              ) : (
                <p className="text-xs text-white/30">
                  Maximum of {MAX_FILES} images added.
                </p>
              )}

              {files.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {previews.map((url, index) => (
                    <div
                      key={url}
                      className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setFiles((prev) => prev.filter((_, i) => i !== index))
                        }
                        aria-label="Remove image"
                        className="absolute right-0.5 top-0.5 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/70 text-xs text-white hover:bg-black"
                      >
                        ×
                      </button>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className={fieldLabel}>Location (click the map)</label>
              <div className="overflow-hidden rounded-xl border border-white/10">
                <StreetMap
                  onLocationSelect={(selected) => {
                    setCoords(selected);
                    setMapError("");
                  }}
                />
              </div>
              {mapError && (
                <p className="mt-1 text-sm text-red-400">{mapError}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 w-full cursor-pointer rounded-xl bg-brand py-3 text-sm font-semibold text-black transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {isPending ? "Submitting..." : "Submit spot"}
        </button>
      </form>
    </div>
  );
}
