import { GoogleSignInButton } from "./GoogleSignInButton";
import { LoginForm } from "./LoginForm";
import { Button, Card } from "@/shared/ui";
import { AuthHeader } from "@/app/(auth)/_components/AuthHeader";

export function LoginPage({ next }: { next: string }) {
  return (
    <>
      <AuthHeader subtitle="Sign in to continue" />

      <Card className="p-8">
        <LoginForm next={next} />

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-sand" />
          <span className="font-body text-2xs text-earth/40 uppercase tracking-[0.12em]">
            or continue with
          </span>
          <div className="flex-1 h-px bg-sand" />
        </div>

        <GoogleSignInButton next={next} />

        {/* Sign up link */}
        <p className="text-center mt-6 font-body font-light text-sm text-earth/60">
          Don&apos;t have an account?{" "}
          <Button
            href="/signup"
            variant="text"
            size="inline"
            className="text-orange font-medium"
          >
            Sign up
          </Button>
        </p>
      </Card>
    </>
  );
}
