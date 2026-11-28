export type Stance = "REGULAR" | "GOOFY";

export interface UserType {
  id: number;
  username: string;
  email: string;
  age: number | null;
  hometown: string | null;
  stance: Stance;
  role: "USER" | "ADMIN";
  profileImage: string | null;
}

export interface SignUpUser {
  username: string;
  email: string;
  password: string;
  age?: number;
  hometown?: string;
  stance?: Stance;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface EditUserData {
  username?: string;
  age?: number;
  hometown?: string;
  stance?: Stance;
  image?: File | null;
  deleteImage?: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}
export interface StreetImage {
  id: number;
  url: string;
}

export interface StreetSpot {
  id: number;
  name: string;
  spotType: string;
  description: string;
  bestTimeType: string;
  parkingType: string;
  surfaceType: string;
  pedestriansType: string;
  latitude: number;
  longitude: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  createdById: number | null;
  images: StreetImage[];
  createdBy: {
    id: number;
    username: string;
    profileImageUrl: string | null;
  } | null;
}

export interface StreetListResponse {
  data: StreetSpot[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CheckIn {
  id: number;
  streetId: number;
  userId: number;
  createdAt: string;
  user?: { id: number; username: string; profileImageUrl: string | null };
}

export interface CreateStreetSpotData {
  name: string;
  spotType: string;
  bestTimeType: string;
  parkingType: string;
  surfaceType: string;
  pedestriansType: string;
  description?: string;
  latitude: number;
  longitude: number;
  images: File[];
}

export interface AdminUser extends Omit<UserType, "profileImage"> {
  isBlocked: boolean;
  profileImageUrl: string | null;
}
