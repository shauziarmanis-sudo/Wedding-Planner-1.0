import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex gap-6 md:gap-10">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="inline-block font-bold text-headline">Life-Start</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <span className="text-sm font-medium text-body">
                {session?.user?.name}
              </span>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-8 pt-6">
        {children}
      </main>
    </div>
  );
}
