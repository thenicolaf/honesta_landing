"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { USER_ROUTES, ADMIN_ROUTES } from "@/shared/consts/routes";

interface NavUserButtonProps {
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  isAdmin: boolean;
}

export function NavUserButton({ user, isAdmin }: NavUserButtonProps) {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/panel" ? pathname === "/panel" : pathname.startsWith(href);

  if (user) {
    const fullName = [user.firstName, user.lastName]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(" ")
      .trim();
    const avatarInitial = user.firstName?.trim() || user.email;
    const menuLabel = fullName || user.email;

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1">
            <Avatar initial={avatarInitial} size="sm" title={menuLabel} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right">
            <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {USER_ROUTES.map((route) => (
              <DropdownMenuItem key={route.href} asChild className={isActive(route.href) ? "text-orange!" : ""}>
                <Link href={route.href}>{route.label}</Link>
              </DropdownMenuItem>
            ))}
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <li
                  role="presentation"
                  className="block max-h-[40vh] overflow-y-auto overscroll-contain"
                >
                  <ul role="group" className="m-0 p-0 list-none">
                    {ADMIN_ROUTES.map((route) => (
                      <DropdownMenuItem
                        key={route.href}
                        asChild
                        className={isActive(route.href) ? "text-orange!" : ""}
                      >
                        <Link href={route.href}>{route.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </ul>
                </li>
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
