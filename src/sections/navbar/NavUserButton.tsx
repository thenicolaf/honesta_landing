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
  isAdmin: boolean;
}

export function NavUserButton({ user, isAdmin }: NavUserButtonProps) {
  const [logoutOpen, setLogoutOpen] = useState(false);

  if (user) {
    return (
      <>
        <DropdownMenu id="nav-user">
          <DropdownMenuTrigger className="p-1">
            <Avatar initial={user.email} size="sm" title={user.email} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right">
            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/favorites">Favorites</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/orders">Orders</Link>
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/panel">Admin Panel</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/categories">Categories</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/products">Products</Link>
                </DropdownMenuItem>
              </>
            )}
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
