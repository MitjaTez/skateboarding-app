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
