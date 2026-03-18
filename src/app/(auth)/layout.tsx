export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grow min-h-160 bg-cream flex items-center justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
