"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  toastSuccess,
  toastError,
} from "@/shared/ui";
import {
  IconShare,
  IconLink,
  IconWhatsApp,
  IconTelegram,
  IconInstagram,
} from "@/shared/icons";
import { cn } from "@/shared/utils/cn";

interface ShareButtonProps {
  title: string;
  slug: string;
  align?: "left" | "right";
  className?: string;
}

function buildProductUrl(slug: string) {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base.replace(/\/$/, "")}/products/${slug}`;
}

function openInNewTab(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ShareButton({
  title,
  slug,
  align = "left",
  className,
}: ShareButtonProps) {
  const handleWhatsApp = () => {
    const url = buildProductUrl(slug);
    openInNewTab(
      `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
    );
  };

  const handleTelegram = () => {
    const url = buildProductUrl(slug);
    openInNewTab(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    );
  };

  const handleInstagram = () => {
    const url = buildProductUrl(slug);
    // Instagram has no public "share to DM" URL with recipient picker that
    // accepts pre-filled text. Open the new-DM screen (user picks any
    // recipient) and silently stage the link in clipboard so they can paste.
    void copyToClipboard(`${title} — ${url}`);
    openInNewTab("https://www.instagram.com/direct/new/");
  };

  const handleCopyLink = async () => {
    const url = buildProductUrl(slug);
    const copied = await copyToClipboard(url);
    if (copied) {
      toastSuccess("Link copied");
    } else {
      toastError("Could not copy link");
    }
  };

  return (
    <DropdownMenu className={cn("shrink-0", className)}>
      <DropdownMenuTrigger asChild stopPropagation>
        <Button
          as="button"
          type="button"
          variant="outline"
          size="icon"
          aria-label="Share product"
        >
          <IconShare className="w-3.5 h-3.5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align}>
        <DropdownMenuItem onClick={handleWhatsApp}>
          <IconWhatsApp className="w-4 h-4" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTelegram}>
          <IconTelegram className="w-4 h-4" />
          Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleInstagram}>
          <IconInstagram className="w-4 h-4" />
          Instagram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          <IconLink className="w-4 h-4" />
          Copy link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
