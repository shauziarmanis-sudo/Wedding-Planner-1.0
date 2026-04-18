import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col space-y-8">
        <h1 className="text-4xl font-bold text-headline tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Life-Start
        </h1>
        <p className="text-xl text-body max-w-[600px] text-center">
          Platform pasangan dari Wedding Planning otomatis berubah menjadi Household Financial Dashboard.
        </p>
        <div className="flex gap-4">
          <Link 
            href="/api/auth/signin" 
            className="px-8 py-3 rounded-full bg-cta text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Mulai Sekarang
          </Link>
        </div>
      </div>
    </main>
  );
}
