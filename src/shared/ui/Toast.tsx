"use client";

import {
  ToastContainer,
  toast,
  cssTransition,
  type ToastOptions,
} from "react-toastify";
import { Button } from "./Button";
import { IconCheck, IconAlertCircle, IconInfo, IconX } from "@/shared/icons";

const softSlide = cssTransition({
  enter: "toast-enter",
  exit: "toast-exit",
});

// ─── Toast Container (mount once in root layout) ────────────────────────────

export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      transition={softSlide}
      autoClose={4000}
      hideProgressBar
      newestOnTop
      closeOnClick
      pauseOnFocusLoss={false}
      draggable={false}
      pauseOnHover
      limit={5}
      className="p-4!"
      toastClassName="!bg-white-warm !rounded-[16px] !shadow-sm !font-body !text-sm !text-earth !pl-5 !pr-10 !py-4 !min-h-0 !flex !items-center !gap-3"
      closeButton={({ closeToast }) => (
        <Button
          as="button"
          type="button"
          variant="text"
          color="default"
          size="icon"
          onClick={closeToast}
          className="absolute top-3 right-3 w-6! h-6!"
          aria-label="Close"
        >
          <IconX className="w-3 h-3" />
        </Button>
      )}
    />
  );
}

// ─── Toast helpers ──────────────────────────────────────────────────────────

const baseOptions: ToastOptions = {
  icon: false,
};

export function toastSuccess(message: string, options?: ToastOptions) {
  return toast(message, {
    ...baseOptions,
    ...options,
    icon: <IconCheck className="w-4.5 h-4.5 text-moss shrink-0" />,
  });
}

export function toastError(message: string, options?: ToastOptions) {
  return toast(message, {
    ...baseOptions,
    ...options,
    icon: <IconAlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />,
  });
}

export function toastInfo(message: string, options?: ToastOptions) {
  return toast(message, {
    ...baseOptions,
    ...options,
    icon: <IconInfo className="w-4.5 h-4.5 text-orange shrink-0" />,
  });
}
