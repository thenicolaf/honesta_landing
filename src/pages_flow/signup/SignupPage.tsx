import { SignupForm } from "./SignupForm";
import { Button, Card } from "@/shared/ui";
import { AuthHeader } from "@/app/(auth)/_components/AuthHeader";

export function SignupPage() {
  return (
    <>
      <AuthHeader subtitle="Create your account" />

      <Card className="p-8">
        <SignupForm />

        <p className="text-center mt-6 font-body font-light text-sm text-earth/60">
          Already have an account?{" "}
          <Button
            href="/login"
            variant="text"
            size="inline"
            className="text-orange font-medium"
          >
            Sign in
          </Button>
        </p>
      </Card>
    </>
  );
}
