"use client";

import { useState } from "react";
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
import { SignOutButton } from "@/pages_flow/profile/SignOutButton";

interface NavUserButtonProps {
  user: { email: string } | null;
}

export function NavUserButton({ user }: NavUserButtonProps) {
  const [logoutOpen, setLogoutOpen] = useState(false);

  if (user) {
    return (
      <>
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
            <DropdownMenuItem>
              <Link href="/favorites" className="w-full">
                Favorites
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/orders" className="w-full">
                Orders
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={() => setLogoutOpen(true)}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dialog lives outside DropdownMenu so it isn't unmounted when the dropdown closes */}
        <SignOutButton open={logoutOpen} onOpenChange={setLogoutOpen} />
      </>
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
