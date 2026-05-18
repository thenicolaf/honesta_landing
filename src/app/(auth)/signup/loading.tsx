import { Card, Skeleton } from "@/shared/ui";
import { AuthHeader } from "../_components/AuthHeader";

export default function SignupLoading() {
  return (
    <>
      <AuthHeader subtitle="Create your account" />
      <Card variant="default" padding="lg" className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 min-[26.25rem]:grid-cols-2">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
        <Skeleton className="h-11 w-full rounded-full mt-2" />
      </Card>
      <Skeleton className="h-3 w-56 mx-auto mt-6" />
    </>
  );
}
