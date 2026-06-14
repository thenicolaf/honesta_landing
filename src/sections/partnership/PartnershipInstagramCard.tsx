import { Button } from "@/shared/ui";
import { IconInstagram } from "@/shared/icons";

export function PartnershipInstagramCard() {
  return (
    <div className="bg-white-warm border border-parchment rounded-2xl p-5 sm:p-8 flex flex-col gap-5">
      <div>
        <p className="font-body font-semibold text-earth text-base mb-1">
          Message us directly
        </p>
        <p className="font-body font-light text-earth/60 text-sm leading-relaxed">
          Quick questions, samples, or pricing — reach us on Instagram.
        </p>
      </div>

      <Button
        href={process.env.NEXT_PUBLIC_INSTAGRAM_DM_URL}
        target="_blank"
        rel="noopener noreferrer"
        variant="primary"
        size="lg"
        className="w-full justify-center whitespace-nowrap"
      >
        <IconInstagram className="w-5 h-5 shrink-0" />
        Write us on Instagram
      </Button>

      <Button
        href={process.env.NEXT_PUBLIC_INSTAGRAM_BRAND_URL}
        target="_blank"
        rel="noopener noreferrer"
        variant="text"
        size="lg"
        className="text-earth/45 hover:text-orange font-light -mt-2 w-full justify-center"
      >
        instagram.com/{process.env.NEXT_PUBLIC_INSTAGRAM_BRAND}
      </Button>
    </div>
  );
}
