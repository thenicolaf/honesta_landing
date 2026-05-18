import { Card, Skeleton } from "@/shared/ui";
import { AuthHeader } from "../_components/AuthHeader";

export default function VerifyEmailLoading() {
  return (
    <>
      <AuthHeader subtitle="Verify your email" />
      <Card variant="default" padding="lg" className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4 mx-auto" />
        </div>
        <div className="flex gap-2 justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-10" />
          ))}
        </div>
        <Skeleton className="h-11 w-full rounded-full" />
        <Skeleton className="h-3 w-32 mx-auto" />
      </Card>
    </>
  );
}
