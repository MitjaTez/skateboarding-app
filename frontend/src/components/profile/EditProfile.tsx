"use client";

import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthContext } from "../../context/auth-context";

// Limits match the backend EditUserDto
const validator = z.object({
  username: z.string().min(3, "At least 3 characters").max(30, "Too long"),
  age: z
    .number()
    .int()
    .min(5, "Min age is 5")
    .max(120, "Max age is 120")
    .optional(),
  hometown: z.string().max(100, "Too long").optional(),
  stance: z.enum(["REGULAR", "GOOFY"]),
});

type FormFields = z.infer<typeof validator>;

const labelCls =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-white/30";
const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-main-title-color placeholder:text-white/20 focus:border-brand/40 focus:outline-none transition-colors";
const errCls = "mt-1 text-xs text-red-400";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export default function EditProfile({ open, setOpen }: Props) {
  if (!open) return null;
  return <EditForm setOpen={setOpen} />;
}

function EditForm({ setOpen }: { setOpen: (value: boolean) => void }) {
  const { user, editUser } = useAuthContext();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteImage, setDeleteImage] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(validator),
    defaultValues: {
      username: user?.username ?? "",
      age: user?.age ?? undefined,
      hometown: user?.hometown ?? "",
      stance: user?.stance ?? "REGULAR",
    },
  });

  const stance = watch("stance");

  // Lock page scroll while the modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Free the preview URL when it changes or the modal closes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onDrop = (files: File[]) => {
    const selected = files[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setDeleteImage(false);
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      await editUser({
        username: data.username,
        age: data.age,
        hometown: data.hometown,
        stance: data.stance,
        image: file,
        deleteImage,
      });
      setOpen(false);
    } catch {
      // the provider already showed an error toast
    }
  };

  const avatar =
    previewUrl || (!deleteImage && user?.profileImage) || "/avatar-default.jpg";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <span className="text-lg font-bold text-main-title-color">
                Edit Profile
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-all hover:rotate-90 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-5 px-6 py-5">
              <div>
                <label className={labelCls}>Username</label>
                <input
                  {...register("username")}
                  placeholder="Enter your username"
                  className={inputCls}
                />
                {errors.username && (
                  <p className={errCls}>{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Age</label>
                <input
                  {...register("age", {
                    setValueAs: (v) =>
                      v === "" || v == null ? undefined : Number(v),
                  })}
                  type="number"
                  placeholder="Enter your age"
                  className={inputCls}
                />
                {errors.age && <p className={errCls}>{errors.age.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Hometown</label>
                <input
                  {...register("hometown")}
                  placeholder="Enter your hometown"
                  className={inputCls}
                />
                {errors.hometown && (
                  <p className={errCls}>{errors.hometown.message}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Stance</label>
                <div className="flex gap-2">
                  {(["REGULAR", "GOOFY"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setValue("stance", option, { shouldValidate: true })
                      }
                      className={`flex-1 cursor-pointer rounded-xl border px-3 py-2 text-sm transition ${
                        stance === option
                          ? "border-brand bg-brand text-black"
                          : "border-white/10 text-main-title-color hover:border-white/30"
                      }`}
                    >
                      {option === "REGULAR" ? "Regular" : "Goofy"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Profile Image</label>
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatar}
                    alt="Profile"
                    className="h-20 w-20 shrink-0 rounded-full border-2 border-white/10 object-cover"
                  />
                  <div className="flex min-w-0 flex-col gap-2 text-sm">
                    {file ? (
                      <>
                        <p className="truncate text-main-title-color">
                          {file.name}
                        </p>
                        <p className="text-xs text-white/30">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="w-fit cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 hover:text-white"
                        >
                          Cancel upload
                        </button>
                      </>
                    ) : deleteImage ? (
                      <>
                        <p className="text-red-400">Image will be deleted</p>
                        <button
                          type="button"
                          onClick={() => setDeleteImage(false)}
                          className="w-fit cursor-pointer rounded-lg border border-brand/25 bg-brand/10 px-3 py-1.5 text-xs text-brand hover:bg-brand/20"
                        >
                          Keep image
                        </button>
                      </>
                    ) : user?.profileImage ? (
                      <>
                        <p className="text-white/50">Current profile image</p>
                        <button
                          type="button"
                          onClick={() => setDeleteImage(true)}
                          className="w-fit cursor-pointer rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20"
                        >
                          Remove image
                        </button>
                      </>
                    ) : (
                      <p className="text-white/30">No profile image</p>
                    )}
                  </div>
                </div>

                {!file && (
                  <Dropzone
                    onDrop={onDrop}
                    accept={{
                      "image/jpeg": [],
                      "image/png": [],
                      "image/webp": [],
                    }}
                    maxFiles={1}
                    maxSize={5 * 1024 * 1024}
                  >
                    {({ getRootProps, getInputProps, isDragActive }) => (
                      <div
                        {...getRootProps()}
                        className={`mt-3 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-5 transition-all ${
                          isDragActive
                            ? "border-brand/60 bg-brand/10"
                            : "border-white/10 hover:border-brand/30 hover:bg-white/[0.03]"
                        }`}
                      >
                        <input {...getInputProps()} />
                        <span className="text-xs text-white/30">
                          {user?.profileImage
                            ? "Upload new image to replace"
                            : "Click or drag & drop (max 5 MB)"}
                        </span>
                      </div>
                    )}
                  </Dropzone>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 px-6 py-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer rounded-xl bg-brand py-3 text-sm font-semibold text-black transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
