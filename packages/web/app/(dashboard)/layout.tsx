import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { RoleProvider } from "@/components/dashboard/RoleProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <div className="flex min-h-svh w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto flex max-w-[1200px] flex-col gap-6 p-4 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleProvider>
  );
}
