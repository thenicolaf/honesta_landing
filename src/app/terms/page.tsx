import type { Metadata } from "next";
import { GoBackButton } from "@/app/_components/GoBackButton";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <main className="grow bg-cream pt-24 pb-16 px-4">
      <div className="mx-auto max-w-3xl">
        <GoBackButton label="Back" className="mb-4" />

        <p className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-3 text-center">
          Legal
        </p>
        <h1
          className="font-display font-bold italic text-heading leading-tight text-center mb-10"
          style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
        >
          Terms and Conditions
        </h1>

        <div className="font-body font-light text-earth/80 text-sm leading-relaxed space-y-10">
          {/* 1. Introduction */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-heading text-xl">
              1. Introduction
            </h2>
            <p>
              Welcome to Honesta.ae. This website is owned and operated by
              Honesta&nbsp;-&nbsp;F.Z.E, a Free Zone Establishment with Limited
              Liability registered in the Ajman Free Zone, UAE, under License
              No.&nbsp;49464. Our registered office is located at Office
              C11F-SF7123, Ajman Free Zone C1 Building. By accessing this
              website, you agree to be bound by these Terms and Conditions.
            </p>
          </section>

          {/* 2. Nature of Products */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-heading text-xl">
              2. Nature of Products
            </h2>
            <p>
              Honesta provides natural food products, including dried fruits,
              fruit leather, seed mixes, and other food products.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="font-medium text-earth">
                  Perishable Goods:
                </strong>{" "}
                As our products are food items, they are subject to specific
                storage requirements. Customers are advised to follow the storage
                instructions provided on the packaging.
              </li>
              <li>
                <strong className="font-medium text-earth">
                  Handcrafted Nature:
                </strong>{" "}
                Our products are handcrafted; therefore, slight variations in
                color, texture, size, and weight may occur between batches.
              </li>
            </ul>
          </section>

          {/* 3. Pricing and Payment */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-heading text-xl">
              3. Pricing and Payment
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>All prices are listed in UAE Dirhams (AED).</li>
              <li>
                We accept payments online using Visa, MasterCard, American
                Express, and UnionPay credit/debit cards in AED (or any other
                agreed currency). We also support mobile payment solutions
                including Apple Pay and Google Pay.
              </li>
              <li>
                The cardholder must retain a copy of transaction records and
                Merchant policies and rules.
              </li>
              <li>
                <strong className="font-medium text-earth">VAT:</strong> Prices
                are as displayed on the website. While the company holds a Tax
                Registration Number (TRN), VAT is applied in accordance with UAE
                Federal Decree-Law based on the current registration status.
              </li>
              <li>
                Honesta will NOT deal or provide any services or products to any
                of OFAC (Office of Foreign Assets Control) sanctions countries in
                accordance with the law of UAE.
              </li>
            </ul>
          </section>

          {/* 4. Delivery Policy */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-heading text-xl">
              4. Delivery Policy
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                We deliver across the UAE. Delivery is handled either by our own
                logistics or via third-party partners.
              </li>
              <li>
                Delivery timelines and charges are displayed at checkout.
              </li>
              <li>
                Specific delivery terms may apply depending on the emirate and
                the nature of the food items.
              </li>
            </ul>
          </section>

          {/* 5. Refund and Cancellation Policy */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-heading text-xl">
              5. Refund and Cancellation Policy
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="font-medium text-earth">Cancellation:</strong>{" "}
                Customers can cancel an order within 1 hour of placing it,
                provided it has not been dispatched.
              </li>
              <li>
                <strong className="font-medium text-earth">
                  Returns (Food Safety):
                </strong>{" "}
                Due to the nature of food products, we do not accept returns of
                opened or consumed items for hygiene and safety reasons.
              </li>
              <li>
                <strong className="font-medium text-earth">Refunds:</strong>{" "}
                Refunds will be made only in the case of damaged or incorrect
                items delivered. Claims must be made within 24 hours of receipt
                with photo evidence.
              </li>
              <li>
                Refunds will be done only through the Original Mode of Payment.
                Please allow up to 10–45 days for the refund transfer to be
                completed.
              </li>
            </ul>
          </section>

          {/* 6. Health and Allergy Disclaimer */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-heading text-xl">
              6. Health and Allergy Disclaimer
            </h2>
            <p>
              While we strive for transparency, our products are processed in a
              facility that handles nuts and seeds. Customers with severe
              allergies should exercise caution. Honesta is not liable for
              adverse reactions if the ingredients were clearly labeled.
            </p>
          </section>

          {/* 7. Governing Law and Jurisdiction */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-heading text-xl">
              7. Governing Law and Jurisdiction
            </h2>
            <p>
              Any purchase, dispute or claim arising out of or in connection with
              this website shall be governed and construed in accordance with the
              laws of the UAE.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
