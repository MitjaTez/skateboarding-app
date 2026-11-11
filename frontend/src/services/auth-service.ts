"use client";

import { isAxiosError } from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { LoginUser, SignUpUser, UserType } from "./types";

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
