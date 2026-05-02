import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Layout khusus untuk Builder page:
 * - Auth check (redirect jika belum login)
 * - Tanpa sidebar/header dashboard (full-screen editor)
 * - Overflow hidden agar Puck tidak scroll di body
 */
export default async function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50">
      {children}
    </div>
  );
}
