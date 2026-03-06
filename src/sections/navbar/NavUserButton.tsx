"use client";

import Link from "next/link";
import { UserCircle } from "lucide-react";
import { Avatar } from "@/shared/ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/shared/ui";
import { signOut } from "@/pages_flow/profile/actions";

interface NavUserButtonProps {
  user: { email: string } | null;
}

export function NavUserButton({ user }: NavUserButtonProps) {
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="p-1">
          <Avatar initial={user.email} size="sm" title={user.email} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="right">
          <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/profile" className="w-full">
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            destructive
            onClick={async () => {
              await signOut();
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link
      href="/login"
      className="p-2 text-earth hover:text-orange transition-colors duration-200"
      aria-label="Sign in"
    >
      <UserCircle className="w-5 h-5" strokeWidth={1.5} />
    </Link>
  );
}
