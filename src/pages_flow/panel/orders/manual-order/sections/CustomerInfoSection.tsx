import {
  FormError,
  FormInput,
  FormLabel,
  FormPhoneInput,
} from "@/shared/ui";
import type { CustomerInfo } from "@/shared/types";
import type { ManualOrderState } from "../actions";
import { ManualOrderSection } from "./ManualOrderSection";

interface CustomerInfoSectionProps {
  defaults: Partial<CustomerInfo>;
  fieldErrors?: ManualOrderState["fieldErrors"];
}

export function CustomerInfoSection({
  defaults,
  fieldErrors,
}: CustomerInfoSectionProps) {
  return (
    <ManualOrderSection title="Customer info">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FormLabel htmlFor="firstName" required>
            First name
          </FormLabel>
          <FormInput
            id="firstName"
            name="firstName"
            defaultValue={defaults.firstName}
            placeholder="Ahmed"
            state={fieldErrors?.firstName ? "error" : "default"}
          />
          <FormError message={fieldErrors?.firstName} />
        </div>
        <div>
          <FormLabel htmlFor="lastName" required>
            Last name
          </FormLabel>
          <FormInput
            id="lastName"
            name="lastName"
            defaultValue={defaults.lastName}
            placeholder="Al Rashid"
            state={fieldErrors?.lastName ? "error" : "default"}
          />
          <FormError message={fieldErrors?.lastName} />
        </div>
      </div>

      <div>
        <FormLabel htmlFor="email" required>
          Email
        </FormLabel>
        <FormInput
          id="email"
          name="email"
          type="email"
          defaultValue={defaults.email}
          placeholder="you@example.com"
          state={fieldErrors?.email ? "error" : "default"}
        />
        <FormError message={fieldErrors?.email} />
      </div>

      <div>
        <FormLabel htmlFor="phone" required>
          Phone
        </FormLabel>
        <FormPhoneInput
          id="phone"
          name="phone"
          defaultValue={defaults.phone}
          state={fieldErrors?.phone ? "error" : "default"}
        />
        <FormError message={fieldErrors?.phone} />
      </div>
    </ManualOrderSection>
  );
}
