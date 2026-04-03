import {
  Badge,
  DataCard,
  DataCardHeader,
  DataCardBody,
  DataCardField,
  DataCardFooter,
  DataCardList,
  DataCardEmpty,
  CopyText,
} from "@/shared/ui";
import { displayAddress } from "@/shared/utils/address";
import { formatDateTime } from "@/shared/ui/Table";
import { Handshake } from "lucide-react";
import type { PartnershipInquiry } from "./types";

interface InquiryCardsProps {
  inquiries: PartnershipInquiry[];
  emptyDescription?: string;
}

export function InquiryCards({ inquiries, emptyDescription }: InquiryCardsProps) {
  if (inquiries.length === 0) {
    return (
      <DataCardEmpty
        icon={<Handshake className="w-10 h-10 text-earth/15" />}
        label="No inquiries found"
        description={emptyDescription}
      />
    );
  }

  return (
    <DataCardList className="md:grid-cols-2">
      {inquiries.map((inquiry) => (
        <DataCard key={inquiry.id}>
          <DataCardHeader>
            <span className="font-semibold text-sm text-earth">
              {inquiry.business_name}
            </span>
            {inquiry.business_type && (
              <Badge variant="warm" size="sm">
                {inquiry.business_type}
              </Badge>
            )}
          </DataCardHeader>

          <DataCardBody>
            <DataCardField label="Contact">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm">{inquiry.contact_name}</span>
                <CopyText text={inquiry.phone} className="text-2xs text-earth/40">{inquiry.phone}</CopyText>
              </div>
            </DataCardField>

            {inquiry.message && (
              <DataCardField label="Message">
                <span className="text-2xs text-earth/60 italic">{inquiry.message}</span>
              </DataCardField>
            )}

            {inquiry.address && (
              <DataCardField label="Address">
                <CopyText text={displayAddress(inquiry.address)} className="text-2xs text-earth/60">{displayAddress(inquiry.address)}</CopyText>
              </DataCardField>
            )}
          </DataCardBody>

          <DataCardFooter className="flex items-center justify-end">
            <span className="text-2xs text-earth/50">
              {formatDateTime(inquiry.created_at)}
            </span>
          </DataCardFooter>
        </DataCard>
      ))}
    </DataCardList>
  );
}
