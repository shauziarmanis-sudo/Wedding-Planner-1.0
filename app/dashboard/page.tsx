import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // NOTE: Di implementasi asli, ini akan fetch dari server action `getAppMetadata`
  // Untuk skeleton, kita set hardcode WEDDING
  const status = 'WEDDING'; 

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-headline">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary">
            {status} MODE
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Vendors</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">12</div>
          </div>
        </div>
        
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Guests</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">250</div>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border border-border bg-card shadow h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Main Chart View</p>
        </div>
        <div className="col-span-3 rounded-xl border border-border bg-card shadow h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Recent Activity</p>
        </div>
      </div>
    </div>
  );
}
