export type UserRole = "user" | "admin" | "business";

export interface ProfileInfo {
  firstName: string;
  lastName: string;
  phone: string;
  gender?: "male" | "female" | "";
  birthday?: string;
  role?: UserRole;
}
