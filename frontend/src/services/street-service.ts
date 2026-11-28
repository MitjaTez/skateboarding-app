"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../lib/api";
import { handleError } from "../lib/handle-error";
import type {
  CheckIn,
  CreateStreetSpotData,
  StreetListResponse,
  StreetSpot,
} from "./types";

export const useFetchStreetSpots = (page: number, limit = 10) =>
  useQuery<StreetListResponse>({
    queryKey: ["streetSpots", page, limit],
    queryFn: async () =>
      (await api.get("/street", { params: { page, limit } })).data,
  });

export const useFetchStreetSpotById = (id?: number) =>
  useQuery<StreetSpot>({
    queryKey: ["street", id],
    queryFn: async () => (await api.get(`/street/${id}`)).data,
    enabled: !!id,
  });

export const useCreateStreetSpot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStreetSpotData) => {
      console.log("Mutation triggered");
      console.log("Data:", data);

      const form = new FormData();

      form.append("name", data.name);
      form.append("spotType", data.spotType);
      form.append("bestTimeType", data.bestTimeType);
      form.append("parkingType", data.parkingType);
      form.append("surfaceType", data.surfaceType);
      form.append("pedestriansType", data.pedestriansType);
      form.append("latitude", String(data.latitude));
      form.append("longitude", String(data.longitude));

      if (data.description) form.append("description", data.description);

      data.images.forEach((file) => form.append("images", file));

      console.log("Sending POST /street");

      const response = await api.post("/street", form);

      console.log("Response:", response.data);

      return response.data;
    },

    onSuccess: () => {
      console.log("Street spot created successfully");
      queryClient.invalidateQueries({ queryKey: ["streetSpots"] });
    },

    onError: (error) => {
      console.error("Street spot creation failed:", error);
      handleError(error, "Failed to submit the spot");
    },
  });
};

export const useFetchStreetCheckIns = (id?: number) =>
  useQuery<CheckIn[]>({
    queryKey: ["streetCheckIns", id],
    queryFn: async () => (await api.get(`/street/${id}/check-ins`)).data ?? [],
    enabled: !!id,
  });

export const useCheckInStreetSpot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      (await api.post(`/street/${id}/check-ins`)).data,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["streetCheckIns", id] });
      toast.success("Checked in successfully!");
    },
    onError: (error) => handleError(error, "Failed to check in"),
  });
};

// Admin hooks: used by the admin panel later
export const useFetchAllStreetSpotsAdmin = (enabled = true) =>
  useQuery<{ data: StreetSpot[]; total: number }>({
    queryKey: ["streetSpotsAdmin"],
    queryFn: async () => (await api.get("/street/admin/all")).data,
    enabled,
  });

export const useApproveStreetSpot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      (await api.patch(`/street/${id}/approve`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streetSpotsAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["streetSpots"] });
    },
    onError: (error) => handleError(error, "Failed to approve"),
  });
};

export const useDeclineStreetSpot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      (await api.patch(`/street/${id}/decline`)).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["streetSpotsAdmin"] }),
    onError: (error) => handleError(error, "Failed to decline"),
  });
};

export const useDeleteStreetSpot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await api.delete(`/street/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streetSpotsAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["streetSpots"] });
      toast.success("Street spot deleted");
    },
    onError: (error) => handleError(error, "Failed to delete"),
  });
};
