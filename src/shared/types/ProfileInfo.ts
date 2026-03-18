export interface ProfileInfo {
  firstName: string;
  lastName: string;
  phone: string;
  gender?: "male" | "female" | "";
  birthday?: string;
  role?: "user" | "admin";
}
