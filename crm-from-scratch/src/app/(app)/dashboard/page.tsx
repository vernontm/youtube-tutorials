import Link from "next/link";
import {
  TrendingUp,
  Users,
  KanbanSquare,
  CheckSquare,
  AlertCircle,
  Phone,
  Mail,
  CalendarClock,
  MessageCircle,
  Circle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadDashboard } from "@/lib/dashboard/data";
import { formatMoney } from "@/lib/deals/types";

const TYPE_ICON = {
  call: Phone,
  email: Mail,
  meeting: CalendarClock,
  follow_up: MessageCircle,
  other: Circle,
} as const;

export default async function DashboardPage() {
  const data = await loadDashboard();

  const kpis = [
    {
      label: "Revenue (MTD)",
      value: formatMoney(data.revenueMtd),
      unit: "won this month",
      icon: TrendingUp,
      featured: true,
    },
    {
      label: "Open pipeline",
      value: formatMoney(data.openDealsValue),
      unit: `${data.openDealsCount} deal${data.openDealsCount === 1 ? "" : "s"}`,
      icon: KanbanSquare,
    },
    {
      label: "Contacts",
      value: String(data.contactsCount),
      unit: "total",
      icon: Users,
    },
    {
      label: "Tasks due",
      value: String(data.tasksDueToday),
      unit: data.tasksOverdue > 0 ? `${data.tasksOverdue} overdue` : "today",
      icon: CheckSquare,
      alert: data.tasksOverdue > 0,
    },
  ];

  const totalDeals = data.stageBreakdown.reduce((sum, s) => sum + s.count, 0);
  const maxStageValue = Math.max(1, ...data.stageBreakdown.map((s) => s.value));

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalDeals === 0 && data.contactsCount === 0
              ? "Your CRM at a glance. Add a contact or deal to see metrics."
              : `Win rate ${data.winRate.toFixed(0)}% · ${totalDeals} deal${totalDeals === 1 ? "" : "s"} tracked`}
          </p>
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
              <k.icon
                className={
                  "size-4 " +
                  (k.featured ? "text-primary" : k.alert ? "text-rose-400" : "text-muted-foreground")
                }
              />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <div
                  className={
                    "text-4xl font-bold tracking-tight tabular-nums " +
                    (k.featured ? "text-primary" : "text-foreground")
                  }
                >
                  {k.value}
                </div>
                <span className={"text-xs " + (k.alert ? "text-rose-400" : "text-muted-foreground")}>
                  {k.unit}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card/60 border-border/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pipeline by stage</CardTitle>
              <CardDescription>Deal value across each stage.</CardDescription>
            </div>
            <Link href="/pipeline" className="text-xs text-primary hover:underline">
              View board →
            </Link>
          </CardHeader>
          <CardContent>
            {totalDeals === 0 ? (
              <div className="h-48 rounded-lg border border-dashed border-border/40 flex items-center justify-center text-sm text-muted-foreground">
                No deals yet — add one from the Pipeline page.
              </div>
            ) : (
              <div className="space-y-3">
                {data.stageBreakdown.map((s) => (
                  <div key={s.stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`uppercase tracking-wider ${s.tone}`}>{s.label}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {s.count} · {formatMoney(s.value)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          s.stage === "won"
                            ? "bg-emerald-500"
                            : s.stage === "lost"
                              ? "bg-rose-500/60"
                              : "bg-primary"
                        }`}
                        style={{ width: `${Math.max(2, (s.value / maxStageValue) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming tasks</CardTitle>
              <CardDescription>Next 6 open items.</CardDescription>
            </div>
            <Link href="/tasks" className="text-xs text-primary hover:underline">
              All →
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open tasks. </p>
            ) : (
              data.upcomingTasks.map((t) => {
                const Icon = TYPE_ICON[t.type];
                const overdue = !!t.due_date && new Date(t.due_date) < new Date();
                return (
                  <div
                    key={t.id}
                    className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/30"
                  >
                    <Icon
                      className={`size-3.5 mt-0.5 shrink-0 ${
                        t.priority === "high" ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{t.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {t.due_date && (
                          <span className={overdue ? "text-rose-400" : ""}>
                            {overdue && <AlertCircle className="inline size-3 mr-0.5" />}
                            {new Date(t.due_date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                        {t.contact && (
                          <Link
                            href={`/contacts/${t.contact.id}`}
                            className="truncate hover:text-primary"
                          >
                            {t.contact.first_name} {t.contact.last_name ?? ""}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card/60 border-border/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recently updated deals</CardTitle>
              <CardDescription>Last 5 changes.</CardDescription>
            </div>
            <Link href="/pipeline" className="text-xs text-primary hover:underline">
              Board →
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentDeals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deals yet.</p>
            ) : (
              <ul className="divide-y divide-border/40">
                {data.recentDeals.map((d) => (
                  <li key={d.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{d.title}</div>
                      <div className="text-xs text-muted-foreground capitalize">{d.stage}</div>
                    </div>
                    <div className="text-sm font-semibold text-primary tabular-nums shrink-0">
                      {formatMoney(d.value)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/15 via-card/80 to-card/60 border-accent/30 backdrop-blur-xl ring-1 ring-accent/20">
          <CardHeader>
            <CardTitle className="text-accent">Quick actions</CardTitle>
            <CardDescription>Jump back into the work.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <QuickLink href="/contacts" label="Contacts" Icon={Users} />
            <QuickLink href="/pipeline" label="Pipeline" Icon={KanbanSquare} />
            <QuickLink href="/tasks" label="Tasks" Icon={CheckSquare} />
            <QuickLink href="/reports" label="Reports" Icon={TrendingUp} muted />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  label,
  Icon,
  muted,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  muted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2.5 hover:border-primary/40 hover:bg-primary/5 transition-colors ${
        muted ? "opacity-60" : ""
      }`}
    >
      <Icon className="size-4 text-primary" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
