"use client";

import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { AdminUser, LoginUser, SignUpUser, UserType } from "./types";
import type { EditUserData } from "./types";
import type { ForgotPasswordData, ResetPasswordData } from "./types";

export const useSignup = (
  onSuccess: () => void,
  onError: (error: unknown) => void,
) =>
  useMutation({
    mutationFn: async (data: SignUpUser) =>
      (await api.post("/auth/signup", data)).data,
    onSuccess,
    onError,
  });

export const useLogin = (
  onSuccess: () => void,
  onError: (error: unknown) => void,
) =>
  useMutation({
    mutationFn: async (data: LoginUser) =>
      (await api.post("/auth/login", data)).data,
    onSuccess,
    onError,
  });

export const useFetchUser = () =>
  useQuery<UserType | null>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        return (await api.get<UserType>("/auth/me")).data;
      } catch (error) {
        if (
          isAxiosError(error) &&
          [401, 403].includes(error.response?.status ?? 0)
        ) {
          return null;
        }
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    retry: false,
  });

export const useSignOut = (
  onSuccess: () => void,
  onError: (error: unknown) => void,
) =>
  useMutation({
    mutationFn: async () => (await api.post("/auth/logout")).data,
    onSuccess,
    onError,
  });

export const useVerifyEmail = () =>
  useMutation({
    mutationFn: async (token: string) =>
      (await api.get("/auth/verify-email", { params: { token } })).data,
  });

export const useEditUser = (
  onSuccess: () => void,
  onError: (error: unknown) => void,
) =>
  useMutation({
    mutationFn: async (data: EditUserData) => {
      const form = new FormData();
      if (data.username) form.append("username", data.username);
      if (typeof data.age === "number") form.append("age", String(data.age));
      if (data.hometown) form.append("hometown", data.hometown);
      if (data.stance) form.append("stance", data.stance);
      if (data.image) form.append("image", data.image); // field name the backend expects
      if (data.deleteImage) form.append("deleteImage", "true");
      return (await api.patch("/user/me", form)).data;
    },
    onSuccess,
    onError,
  });

export const useDeleteProfile = (
  onSuccess: () => void,
  onError: (error: unknown) => void,
) =>
  useMutation({
    mutationFn: async () => (await api.delete("/user/me")).data,
    onSuccess,
    onError,
  });

export const useForgotPassword = (
  onSuccess: () => void,
  onError: (error: unknown) => void,
) =>
  useMutation({
    mutationFn: async (data: ForgotPasswordData) =>
      (await api.post("/auth/forgot-password", data)).data,
    onSuccess,
    onError,
  });

export const useResetPassword = (
  onSuccess: () => void,
  onError: (error: unknown) => void,
) =>
  useMutation({
    mutationFn: async (data: ResetPasswordData) =>
      (await api.put("/auth/reset-password", data)).data,
    onSuccess,
    onError,
  });

/* ------------------------------- Admin only ------------------------------- */

const ADMIN_USERS_KEY = ["admin-users"];

export const useFetchUsersAll = () =>
  useQuery<AdminUser[]>({
    queryKey: ADMIN_USERS_KEY,
    queryFn: async () => (await api.get<AdminUser[]>("/user")).data,
  });

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      action,
    }: {
      userId: number;
      action: "block" | "unblock";
    }) => (await api.patch(`/user/${userId}/${action}`)).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) =>
      (await api.delete(`/user/${userId}`)).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
};
