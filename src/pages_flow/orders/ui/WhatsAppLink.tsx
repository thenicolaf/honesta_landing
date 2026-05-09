import { Button, Tooltip, TooltipTrigger, TooltipContent } from "@/shared/ui";
import { IconWhatsApp } from "@/shared/icons";

interface WhatsAppLinkProps {
  phone: string;
  className?: string;
}

export function WhatsAppLink({ phone, className }: WhatsAppLinkProps) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          href={`https://wa.me/${digits}`}
          target="_blank"
          rel="noopener noreferrer"
          variant="text"
          size="icon"
          aria-label="Open WhatsApp chat"
          className={`text-moss/60 hover:text-moss ${className ?? ""}`}
        >
          <IconWhatsApp className="w-3.5 h-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>WhatsApp</TooltipContent>
    </Tooltip>
  );
}
