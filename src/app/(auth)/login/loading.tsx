import { Card, Skeleton } from "@/shared/ui";
import { AuthHeader } from "../_components/AuthHeader";

export default function LoginLoading() {
  return (
    <>
      <AuthHeader subtitle="Sign in to continue" />
      <Card variant="default" padding="lg" className="flex flex-col gap-4">
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
        <Skeleton className="h-3 w-32 ml-auto" />
        <Skeleton className="h-11 w-full rounded-full" />
        <div className="flex items-center gap-3 my-2">
          <div className="h-px bg-earth/10 grow" />
          <Skeleton className="h-3 w-28" />
          <div className="h-px bg-earth/10 grow" />
        </div>
        <Skeleton className="h-11 w-full rounded-full" />
      </Card>
      <Skeleton className="h-3 w-56 mx-auto mt-6" />
    </>
  );
}
