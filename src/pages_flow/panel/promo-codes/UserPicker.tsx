"use client";

import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { Cake, Mail, User, Venus, Mars } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectEmpty,
} from "@/shared/ui";

export interface UserOption {
  value: string;
  label: string;
  email?: string;
  gender?: "male" | "female";
  birthday?: string;
}

interface UserPickerProps {
  name: string;
  options: UserOption[];
  defaultValue?: string[];
  placeholder?: string;
  state?: "default" | "error";
}

function formatBirthday(birthday: string): string {
  const date = parseISO(birthday);
  return isValid(date) ? format(date, "d MMM yyyy") : birthday;
}

function GenderIcon({ gender }: { gender: "male" | "female" }) {
  if (gender === "female") {
    return <Venus size={11} className="text-pink-500/70" aria-label="Female" />;
  }
  return <Mars size={11} className="text-sky-500/70" aria-label="Male" />;
}

export function UserPicker({
  name,
  options,
  defaultValue = [],
  placeholder = "Leave empty for all users…",
  state,
}: UserPickerProps) {
  const [values, setValues] = useState<string[]>(defaultValue);

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(values)} />
      <MultiSelect
        value={values}
        onValueChange={setValues}
        options={options}
        clearable
      >
        <MultiSelectTrigger
          placeholder={placeholder}
          className={cn(
            "rounded-xl px-4 min-h-10 py-2 text-sm bg-cream",
            state === "error"
              ? "border-red-400 focus-visible:ring-red-300/40"
              : "border-parchment hover:border-orange/50 focus-visible:ring-orange/40",
          )}
        />
        <MultiSelectContent searchPlaceholder="Search users…">
          {(opts) => (
            <>
              {opts.map((o) => {
                const user = options.find((u) => u.value === o.value);
                const searchValue = [
                  o.label,
                  user?.email ?? "",
                  user?.gender ?? "",
                  user?.birthday ?? "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <MultiSelectItem
                    key={o.value}
                    value={o.value}
                    searchValue={searchValue}
                  >
                    <div className="flex-1 flex flex-col gap-0.5 min-w-0 py-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <User
                          size={11}
                          className="shrink-0 text-earth/40"
                          aria-hidden
                        />
                        <span className="truncate font-body text-xs text-earth">
                          {o.label}
                        </span>
                        {user?.gender && <GenderIcon gender={user.gender} />}
                      </div>
                      {(user?.email || user?.birthday) && (
                        <div className="flex items-center gap-3 pl-4 font-body text-2xs text-earth/45">
                          {user?.email && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail
                                size={10}
                                className="shrink-0"
                                aria-hidden
                              />
                              <span className="truncate">{user.email}</span>
                            </span>
                          )}
                          {user?.birthday && (
                            <span className="flex items-center gap-1 shrink-0">
                              <Cake size={10} aria-hidden />
                              {formatBirthday(user.birthday)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </MultiSelectItem>
                );
              })}
              <MultiSelectEmpty />
            </>
          )}
        </MultiSelectContent>
      </MultiSelect>
    </div>
  );
}
