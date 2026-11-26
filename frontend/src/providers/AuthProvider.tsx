"use client";

import { useMemo, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthContext } from "../context/auth-context";
import { handleError } from "../lib/handle-error";
import {
  useDeleteProfile,
  useEditUser,
  useFetchUser,
  useLogin,
  useSignOut,
  useSignup,
  useForgotPassword,
  useResetPassword,
} from "../services/auth-service";

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useFetchUser();

  const { mutateAsync: signUp } = useSignup(
    () => toast.success("Registered! Check your email to verify your account."),
    (error) => handleError(error, "Failed to sign up"),
  );

  const { mutateAsync: login } = useLogin(
    async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Welcome!");
      router.push("/");
    },
    (error) => handleError(error, "Failed to login"),
  );

  const { mutate: signOut } = useSignOut(
    () => {
      queryClient.setQueryData(["user"], null);
      toast.success("You have been logged out.");
      router.push("/");
    },
    (error) => handleError(error, "Failed to log out"),
  );

  const { mutateAsync: editUser } = useEditUser(
    async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Profile updated");
    },
    (error) => handleError(error, "Failed to edit profile"),
  );

  const { mutate: deleteProfile } = useDeleteProfile(
    () => {
      queryClient.setQueryData(["user"], null);
      toast.success("Profile deleted");
      router.push("/");
    },
    (error) => handleError(error, "Failed to delete profile"),
  );

  const { mutateAsync: forgotPassword } = useForgotPassword(
    () => undefined, // the page shows the "check your email" screen
    (error) => handleError(error, "Failed to request a password reset"),
  );

  const { mutateAsync: resetPassword } = useResetPassword(
    () => toast.success("Password changed successfully!"),
    (error) => handleError(error, "Failed to change password"),
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      signUp,
      login,
      signOut,
      editUser,
      deleteProfile,
      forgotPassword,
      resetPassword,
    }),
    [
      user,
      isLoading,
      signUp,
      login,
      signOut,
      editUser,
      deleteProfile,
      forgotPassword,
      resetPassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
