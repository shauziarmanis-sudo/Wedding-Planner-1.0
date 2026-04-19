import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getMetadata } from "@/actions/metadata";
import { AdatInfoCard } from "@/components/checklist/AdatInfoCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RefreshCcw, History } from "lucide-react";
import Link from "next/link";
import { undoAdatSwitch } from "@/actions/checklist.actions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function AdatSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const metadata = await getMetadata();
  const currentAdat = metadata?.adat_type;
  const secondaryAdat = metadata?.adat_secondary;

  async function handleUndo() {
    "use server";
    // For now we assume the previous adat was MODERN if we are undoing.
    // In a full implementation, we'd store history in Google Sheets.
    await undoAdatSwitch('MODERN');
    revalidatePath("/wedding/settings/adat");
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 mr-4">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">Pengaturan Adat Pernikahan</h1>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Adat Saat Ini</h2>
          {currentAdat ? (
            <AdatInfoCard adat={currentAdat} secondaryAdat={secondaryAdat} />
          ) : (
            <div className="bg-gray-50 p-6 rounded-xl border text-center text-gray-500">
              Belum ada adat yang dipilih. Silakan selesaikan onboarding checklist terlebih dahulu.
            </div>
          )}
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Riwayat Perubahan & Rollback</h3>
              <p className="text-sm text-gray-500 mb-4">
                Jika Anda merasa perubahan adat terakhir merusak checklist Anda, Anda dapat melakukan rollback ke status sebelumnya. Ini akan menyembunyikan (skip) task yang ditambahkan otomatis dan mengembalikan status task yang di-skip.
              </p>
              
              <form action={handleUndo}>
                <Button variant="outline" type="submit" className="text-amber-600 border-amber-200 hover:bg-amber-50">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Batalkan Perubahan Adat Terakhir (Undo)
                </Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
