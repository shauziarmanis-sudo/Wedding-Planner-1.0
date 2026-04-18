"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-border">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-headline">
            Selamat Datang di Life-Start
          </h2>
          <p className="mt-2 text-sm text-body/80">
            Login untuk memulai perencanaan dari Wedding hingga Household Finance.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-cta py-3 px-4 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-cta focus:ring-offset-2"
          >
            Lanjutkan dengan Google
          </button>
          <p className="text-xs text-center text-body/60">
            Kami akan membuatkan database pribadi di Google Drive Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
