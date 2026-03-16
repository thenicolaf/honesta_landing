import {
  Badge,
  DataCard,
  DataCardHeader,
  DataCardBody,
  DataCardField,
  DataCardFooter,
  DataCardList,
  DataCardEmpty,
} from "@/shared/ui";
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
                <span className="text-2xs text-earth/40">{inquiry.phone}</span>
              </div>
            </DataCardField>

            {inquiry.message && (
              <DataCardField label="Message">
                <span className="text-2xs text-earth/60 italic">{inquiry.message}</span>
              </DataCardField>
            )}

            {inquiry.address && (
              <DataCardField label="Address">
                <span className="text-2xs text-earth/60">{inquiry.address}</span>
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
