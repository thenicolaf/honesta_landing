import type { Metadata } from "next";
import { GoBackButton } from "@/app/_components/GoBackButton";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false },
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <div className="font-body font-light text-earth/80 text-sm leading-relaxed space-y-10">
          {/* 1. Introduction */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-heading text-xl">
              1. Introduction
            </h2>
            <p>
              At Honesta.ae, operated by Honesta&nbsp;-&nbsp;F.Z.E, we are
              committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, and safeguard your personal information when
              you visit our website or make a purchase.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-heading text-xl">
              2. Information We Collect
            </h2>
            <p>
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="font-medium text-earth">
                  Contact Information:
                </strong>{" "}
                Name, email address, phone number, and delivery address.
              </li>
              <li>
                <strong className="font-medium text-earth">
                  Order Details:
                </strong>{" "}
                History of products purchased (dried fruits, fruit leather, seed
                mixes, and other food products).
              </li>
              <li>
                <strong className="font-medium text-earth">
                  Payment Information:
                </strong>{" "}
                When you make a purchase, payment is processed through secure
                third-party providers (e.g., Network International).
                Honesta&nbsp;-&nbsp;F.Z.E does not store your credit card
                details on our servers.
              </li>
            </ul>
          </section>

          {/* 3. How We Use Your Information */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-heading text-xl">
              3. How We Use Your Information
            </h2>
            <p>We use the collected data to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process and fulfill your orders.</li>
              <li>Communicate with you regarding your order status.</li>
              <li>Improve our website and customer service.</li>
              <li>Comply with UAE legal and regulatory requirements.</li>
            </ul>
          </section>

          {/* 4. Data Security and Third-Party Disclosure */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-heading text-xl">
              4. Data Security and Third-Party Disclosure
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                We implement industry-standard security measures to protect your
                data.
              </li>
              <li>
                All credit/debit cards&apos; details and personally identifiable
                information will NOT be stored, sold, shared, rented, or leased
                to any third parties.
              </li>
              <li>
                The Website Policies and Terms &amp; Conditions may be changed or
                updated occasionally to meet the requirements and standards.
                Therefore, Customers are encouraged to frequently visit these
                sections to be updated about the changes on the website.
                Modifications will be effective on the day they are posted.
              </li>
            </ul>
          </section>

          {/* 5. Cookies */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-heading text-xl">
              5. Cookies
            </h2>
            <p>
              Our website uses cookies to enhance your browsing experience.
              Cookies help us understand how you use the site and remember your
              preferences. You can choose to disable cookies through your browser
              settings.
            </p>
          </section>

          {/* 6. Payment Security */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-heading text-xl">
              6. Payment Security
            </h2>
            <p>
              All online purchases are redirected to a secure payment gateway.
              Honesta.ae ensures that your data is encrypted during transmission
              using Secure Socket Layer (SSL) technology.
            </p>
          </section>

          {/* 7. Your Rights */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-heading text-xl">
              7. Your Rights
            </h2>
            <p>
              Under UAE law, you have the right to access, correct, or request
              the deletion of your personal data. To exercise these rights,
              please contact us at{" "}
              <a
                href="mailto:honestauae@gmail.com"
                className="underline text-orange"
              >
                honestauae@gmail.com
              </a>
              .
            </p>
          </section>

          {/* 8. Contact Us */}
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-heading text-xl">
              8. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact:
            </p>
            <address className="not-italic space-y-1">
              <p className="font-medium text-earth">Honesta - F.Z.E</p>
              <p>
                Office C11F-SF7123, Ajman Free Zone C1 Building, Ajman, UAE
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:honestauae@gmail.com"
                  className="underline text-orange"
                >
                  honestauae@gmail.com
                </a>
              </p>
            </address>
          </section>
        </div>
      </div>
    </main>
  );
}
