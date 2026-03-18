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
              <Link href="/panel/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/panel/favorites">Favorites</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/panel/orders">Orders</Link>
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/panel">Admin Panel</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/panel/categories">Categories</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/panel/products">Products</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/panel/all-orders">All Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/panel/partnerships">Partnerships</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/panel/promotions">Promotions</Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={() => setLogoutOpen(true)}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
