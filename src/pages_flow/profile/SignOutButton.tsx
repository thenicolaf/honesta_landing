"use client";

import { Button } from "@/shared/ui";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/shared/ui";
import { signOut } from "./actions";

interface SignOutButtonProps {
  /** Uncontrolled mode: wrap a trigger element that opens the dialog on click. */
  children?: React.ReactNode;
  /** Controlled mode: caller manages open state (use when trigger lives inside a DropdownMenu). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SignOutButton({ children, open, onOpenChange }: SignOutButtonProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent size="sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Sign out?</DialogTitle>
          <DialogDescription>
            Are you sure you want to sign out of your account?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button
            as="button"
            type="button"
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => signOut()}
          >
            Sign out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
