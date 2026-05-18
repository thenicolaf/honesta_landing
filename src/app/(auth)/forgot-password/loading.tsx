import { Card, Skeleton } from "@/shared/ui";
import { AuthHeader } from "../_components/AuthHeader";

export default function ForgotPasswordLoading() {
  return (
    <>
      <AuthHeader subtitle="Reset your password" />
      <Card variant="default" padding="lg" className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        <Skeleton className="h-11" />
        <Skeleton className="h-11 w-full rounded-full mt-2" />
      </Card>
      <Skeleton className="h-3 w-56 mx-auto mt-6" />
    </>
  );
}
