import { Handshake } from "lucide-react";
import { StatCard, SectionHeading } from "../ui";
import { getPartnershipsCount } from "../queries";

export async function PartnershipsOverview() {
  const count = await getPartnershipsCount();

  return (
    <>
      <SectionHeading>Partnerships</SectionHeading>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Handshake className="w-5 h-5" />} label="Inquiries" value={count} />
      </section>
    </>
  );
}
