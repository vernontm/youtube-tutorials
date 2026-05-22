import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name =
    (user.user_metadata?.full_name as string | undefined) ?? null;

  return (
    <SidebarProvider>
      <AppSidebar user={{ email: user.email ?? "", name }} />
      <SidebarInset className="bg-transparent">
        <div className="p-4 space-y-4">
          <header className="flex h-14 items-center gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 shadow-[0_0_40px_-12px_oklch(0.65_0.22_28/0.35)] backdrop-blur-xl">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm text-muted-foreground">
              Welcome back{name ? `, ${name.split(" ")[0]}` : ""}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 rounded-full bg-background/50 px-3 py-1.5 ring-1 ring-border/60">
                <span className="text-xs text-muted-foreground">Today</span>
                <span className="text-xs font-medium">
                  {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date())}
                </span>
              </div>
            </div>
          </header>
          <main className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl min-h-[calc(100vh-9rem)]">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
