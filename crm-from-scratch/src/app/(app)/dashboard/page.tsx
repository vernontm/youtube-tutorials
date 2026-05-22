import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, KanbanSquare, CheckSquare, ArrowUpRight } from "lucide-react";

const kpis = [
  { label: "Revenue (MTD)", value: "0.00", unit: "USD", icon: TrendingUp, trend: "+0.00", featured: true },
  { label: "Open deals", value: "0", unit: "deals", icon: KanbanSquare, trend: "+0" },
  { label: "Contacts", value: "0", unit: "total", icon: Users, trend: "+0" },
  { label: "Tasks due", value: "0", unit: "today", icon: CheckSquare, trend: "0" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your CRM at a glance. Real data shows up once you add contacts and deals.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          0 of 6 modules completed
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card
            key={k.label}
            className={
              "relative overflow-hidden border-border/60 backdrop-blur-xl " +
              (k.featured
                ? "bg-gradient-to-br from-primary/25 via-card/80 to-card/60 ring-1 ring-primary/40 shadow-[0_0_40px_-12px_oklch(0.65_0.22_28/0.6)]"
                : "bg-card/60")
            }
          >
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardDescription className="text-xs uppercase tracking-wider">{k.label}</CardDescription>
              <k.icon className={"size-4 " + (k.featured ? "text-primary" : "text-muted-foreground")} />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline gap-2">
                <div className={"text-4xl font-bold tracking-tight " + (k.featured ? "text-primary" : "text-foreground")}>
                  {k.value}
                </div>
                <span className="text-xs text-muted-foreground">{k.unit}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-400">
                <ArrowUpRight className="size-3" />
                {k.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card/60 border-border/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Pipeline overview</CardTitle>
            <CardDescription>Deals across your stages will render here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 rounded-lg border border-dashed border-border/40 flex items-center justify-center text-sm text-muted-foreground">
              Pipeline chart — coming in Part 3
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/20 via-card/80 to-card/60 border-accent/30 backdrop-blur-xl ring-1 ring-accent/30">
          <CardHeader>
            <CardTitle className="text-accent">Get started</CardTitle>
            <CardDescription>Part 1 ships auth + the shell.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                Add your first contact (Part 2)
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                Build out your pipeline (Part 3)
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                Track tasks & activities (Part 4)
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
