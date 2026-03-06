import { GoogleSignInButton } from "./GoogleSignInButton";

export function LoginPage() {
  return (
    <main className="grow bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-display font-bold italic text-heading text-[2rem] leading-tight mb-2">
            Honesta
          </h1>
          <p className="font-body font-light text-earth/60 text-sm">
            Войдите, чтобы продолжить
          </p>
        </div>

        <div className="bg-white-warm rounded-2xl p-8 shadow-sm border border-sand">
          <GoogleSignInButton />
        </div>
      </div>
    </main>
  );
}
