export type TaskType = "call" | "email" | "meeting" | "follow_up" | "other";
export type TaskPriority = "low" | "normal" | "high";

export type Task = {
  id: string;
  user_id: string;
  contact_id: string | null;
  deal_id: string | null;
  title: string;
  description: string | null;
  type: TaskType;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskWithRefs = Task & {
  contact: { id: string; first_name: string; last_name: string | null } | null;
  deal: { id: string; title: string } | null;
};

export const TYPE_LABEL: Record<TaskType, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  follow_up: "Follow-up",
  other: "Other",
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

export const PRIORITY_TONE: Record<TaskPriority, string> = {
  low: "text-muted-foreground",
  normal: "text-foreground",
  high: "text-primary",
};

export function isOverdue(task: Task): boolean {
  if (task.completed_at || !task.due_date) return false;
  return new Date(task.due_date) < new Date();
}

export function isDueToday(task: Task): boolean {
  if (task.completed_at || !task.due_date) return false;
  const due = new Date(task.due_date);
  const now = new Date();
  return (
    due.getFullYear() === now.getFullYear() &&
    due.getMonth() === now.getMonth() &&
    due.getDate() === now.getDate()
  );
}
