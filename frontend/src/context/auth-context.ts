"use client";

import { createContext, useContext } from "react";
import type { LoginUser, SignUpUser, UserType } from "../services/types";

export interface AuthContextValue {
  user: UserType | null | undefined;
  isLoading: boolean;
  signUp: (data: SignUpUser) => Promise<unknown>;
  login: (data: LoginUser) => Promise<unknown>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  return context;
}
