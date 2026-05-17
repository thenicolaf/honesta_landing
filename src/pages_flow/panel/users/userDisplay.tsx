import { format, isValid, parseISO } from "date-fns";
import { Mars, Venus } from "lucide-react";

export function formatBirthday(birthday: string): string {
  const date = parseISO(birthday);
  return isValid(date) ? format(date, "d MMM yyyy") : birthday;
}

export function GenderIcon({ gender }: { gender: "male" | "female" }) {
  if (gender === "female") {
    return <Venus size={11} className="text-pink-500/70" aria-label="Female" />;
  }
  return <Mars size={11} className="text-sky-500/70" aria-label="Male" />;
}

export function fullName(
  firstName: string | null,
  lastName: string | null,
): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

export function userLabel(
  firstName: string | null,
  lastName: string | null,
  email: string | null,
  id: string,
): string {
  return fullName(firstName, lastName) || email || id;
}
