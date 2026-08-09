import { Button } from "@/shared/ui";
import { IconWhatsApp } from "@/shared/icons";

const whatsappDigits = (
  process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_PHONE ?? ""
).replace(/\D/g, "");
const email = process.env.NEXT_PUBLIC_EMAIL;

export function PartnershipContactCard() {
  return (
    <div className="bg-white-warm border border-parchment rounded-2xl p-5 sm:p-8 flex flex-col gap-5">
      <div>
        <p className="font-body font-semibold text-earth text-base mb-1">
          Message us directly
        </p>
        <p className="font-body font-light text-earth/60 text-sm leading-relaxed">
          Quick questions, samples, or pricing — reach us on WhatsApp.
        </p>
      </div>

      <Button
        href={`https://wa.me/${whatsappDigits}`}
        target="_blank"
        rel="noopener noreferrer"
        variant="primary"
        size="lg"
        className="w-full justify-center whitespace-nowrap"
      >
        <IconWhatsApp className="w-5 h-5 shrink-0" />
        Contact us on WhatsApp
      </Button>

      {email && (
        <Button
          href={`mailto:${email}`}
          variant="text"
          size="lg"
          className="text-earth/45 hover:text-orange font-light -mt-2 w-full justify-center"
        >
          {email}
        </Button>
      )}
    </div>
  );
}
