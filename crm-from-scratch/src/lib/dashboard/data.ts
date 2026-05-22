import { createClient } from "@/lib/supabase/server";
import { STAGES, type DealStage } from "@/lib/deals/types";

export type DashboardData = {
  revenueMtd: number;
  openDealsCount: number;
  openDealsValue: number;
  contactsCount: number;
  tasksDueToday: number;
  tasksOverdue: number;
  winRate: number;
  stageBreakdown: { stage: DealStage; label: string; tone: string; count: number; value: number }[];
  recentDeals: { id: string; title: string; value: number; stage: DealStage; updated_at: string }[];
  upcomingTasks: {
    id: string;
    title: string;
    due_date: string | null;
    priority: "low" | "normal" | "high";
    type: "call" | "email" | "meeting" | "follow_up" | "other";
    contact: { id: string; first_name: string; last_name: string | null } | null;
  }[];
};

function startOfMonthISO(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function endOfDayISO(date: Date): string {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export async function loadDashboard(): Promise<DashboardData> {
  const supabase = await createClient();
  const monthStart = startOfMonthISO();
  const todayEnd = endOfDayISO(new Date());
  const nowISO = new Date().toISOString();

  // Single round-trip via Promise.all for clarity.
  const [
    { data: deals = [] },
    { count: contactsCount },
    { data: openTasks = [] },
  ] = await Promise.all([
    supabase
      .from("deals")
      .select("id, title, value, stage, updated_at"),
    supabase
      .from("contacts")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("tasks")
      .select(
        "id, title, due_date, priority, type, completed_at, contact:contacts(id, first_name, last_name)",
      )
      .is("completed_at", null)
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(50),
  ]);

  const dealsList = deals ?? [];

  const won = dealsList.filter((d) => d.stage === "won");
  const lost = dealsList.filter((d) => d.stage === "lost");
  const open = dealsList.filter((d) => d.stage !== "won" && d.stage !== "lost");

  const revenueMtd = won
    .filter((d) => d.updated_at >= monthStart)
    .reduce((sum, d) => sum + Number(d.value || 0), 0);

  const openDealsValue = open.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const winRate =
    won.length + lost.length === 0 ? 0 : (won.length / (won.length + lost.length)) * 100;

  const stageBreakdown = STAGES.map((s) => {
    const inStage = dealsList.filter((d) => d.stage === s.key);
    return {
      stage: s.key,
      label: s.label,
      tone: s.tone,
      count: inStage.length,
      value: inStage.reduce((sum, d) => sum + Number(d.value || 0), 0),
    };
  });

  const recentDeals = [...dealsList]
    .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
    .slice(0, 5)
    .map((d) => ({
      id: d.id,
      title: d.title,
      value: Number(d.value || 0),
      stage: d.stage as DealStage,
      updated_at: d.updated_at,
    }));

  const tasksList = openTasks ?? [];
  const tasksOverdue = tasksList.filter(
    (t) => t.due_date && t.due_date < nowISO,
  ).length;
  const tasksDueToday = tasksList.filter(
    (t) => t.due_date && t.due_date >= nowISO && t.due_date <= todayEnd,
  ).length;
  const upcomingTasks = tasksList.slice(0, 6);

  return {
    revenueMtd,
    openDealsCount: open.length,
    openDealsValue,
    contactsCount: contactsCount ?? 0,
    tasksDueToday,
    tasksOverdue,
    winRate,
    stageBreakdown,
    recentDeals,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upcomingTasks: upcomingTasks as any,
  };
}
