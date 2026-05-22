import Link from "next/link";
import { CheckSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewTaskDialog } from "@/components/tasks/new-task-dialog";
import { TaskRow } from "@/components/tasks/task-row";
import type { TaskWithRefs } from "@/lib/tasks/types";
import { isDueToday, isOverdue } from "@/lib/tasks/types";

type Filter = "open" | "completed" | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
];

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: Filter }>;
}) {
  const { filter = "open" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("tasks")
    .select(
      "id, user_id, contact_id, deal_id, title, description, type, priority, due_date, completed_at, created_at, updated_at, contact:contacts(id, first_name, last_name), deal:deals(id, title)",
    )
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (filter === "open") query = query.is("completed_at", null);
  if (filter === "completed") query = query.not("completed_at", "is", null);

  const [{ data: tasks = [], error }, { data: contacts = [] }, { data: deals = [] }] =
    await Promise.all([
      query.returns<TaskWithRefs[]>(),
      supabase.from("contacts").select("id, first_name, last_name").order("first_name"),
      supabase.from("deals").select("id, title").order("created_at", { ascending: false }),
    ]);

  const list = tasks ?? [];

  const overdue = list.filter(isOverdue);
  const today = list.filter(isDueToday);
  const upcoming = list.filter(
    (t) => !t.completed_at && !isOverdue(t) && !isDueToday(t),
  );
  const completed = list.filter((t) => t.completed_at);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filter === "open" && `${list.length} open · ${overdue.length} overdue · ${today.length} due today`}
            {filter === "completed" && `${list.length} completed`}
            {filter === "all" && `${list.length} total`}
          </p>
        </div>
        <NewTaskDialog contacts={contacts ?? []} deals={deals ?? []} />
      </div>

      <div className="flex gap-1 p-1 rounded-lg bg-card/40 border border-border/60 w-fit">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/tasks?filter=${f.key}`}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === f.key
                ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="py-4 text-sm text-destructive">{error.message}</CardContent>
        </Card>
      )}

      {!error && list.length === 0 ? (
        <Card className="bg-card/60 border-border/60 backdrop-blur-xl">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center gap-3">
            <div className="size-12 rounded-full bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center">
              <CheckSquare className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {filter === "completed" ? "Nothing completed yet." : "No tasks."}
              </p>
              <p className="text-sm text-muted-foreground">
                {filter === "completed"
                  ? "Knock something out and it'll show up here."
                  : "Add a task to track follow-ups, calls, and meetings."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : filter === "open" ? (
        <div className="space-y-6">
          <TaskGroup title="Overdue" tone="text-rose-400" tasks={overdue} contacts={contacts ?? []} deals={deals ?? []} />
          <TaskGroup title="Due today" tone="text-accent" tasks={today} contacts={contacts ?? []} deals={deals ?? []} />
          <TaskGroup title="Upcoming" tasks={upcoming} contacts={contacts ?? []} deals={deals ?? []} />
        </div>
      ) : filter === "completed" ? (
        <TaskGroup title="" tasks={completed} contacts={contacts ?? []} deals={deals ?? []} />
      ) : (
        <TaskGroup title="" tasks={list} contacts={contacts ?? []} deals={deals ?? []} />
      )}
    </div>
  );
}

function TaskGroup({
  title,
  tone,
  tasks,
  contacts,
  deals,
}: {
  title: string;
  tone?: string;
  tasks: TaskWithRefs[];
  contacts: { id: string; first_name: string; last_name: string | null }[];
  deals: { id: string; title: string }[];
}) {
  if (tasks.length === 0) return null;
  return (
    <Card className="bg-card/60 border-border/60 backdrop-blur-xl">
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className={`text-base ${tone ?? ""}`}>{title}</CardTitle>
          <CardDescription>{tasks.length} task{tasks.length === 1 ? "" : "s"}</CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} contacts={contacts} deals={deals} />
        ))}
      </CardContent>
    </Card>
  );
}
