"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Phone, Mail, CalendarClock, MessageCircle, Circle, Trash2, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskForm } from "./task-form";
import {
  TYPE_LABEL,
  PRIORITY_TONE,
  isOverdue,
  isDueToday,
  type TaskType,
  type TaskWithRefs,
} from "@/lib/tasks/types";
import { deleteTask, toggleTaskComplete, updateTask, type TaskFormState } from "@/app/(app)/tasks/actions";

type ContactOption = { id: string; first_name: string; last_name: string | null };
type DealOption = { id: string; title: string };

const TYPE_ICON: Record<TaskType, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  meeting: CalendarClock,
  follow_up: MessageCircle,
  other: Circle,
};

export function TaskRow({
  task,
  contacts,
  deals,
}: {
  task: TaskWithRefs;
  contacts: ContactOption[];
  deals: DealOption[];
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const done = !!task.completed_at;
  const overdue = isOverdue(task);
  const today = isDueToday(task);
  const TypeIcon = TYPE_ICON[task.type];

  const updateAction = (state: TaskFormState, fd: FormData) => updateTask(task.id, state, fd);

  return (
    <div
      className={`group flex items-start gap-3 p-3 rounded-lg border border-border/40 hover:border-border/80 bg-card/40 transition-colors ${
        done ? "opacity-60" : ""
      }`}
    >
      <Checkbox
        checked={done}
        onCheckedChange={(checked) =>
          startTransition(() => toggleTaskComplete(task.id, checked === true))
        }
        className="mt-0.5"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeIcon className="size-3.5 text-muted-foreground shrink-0" />
          <span className={`text-xs uppercase tracking-wider ${PRIORITY_TONE[task.priority]}`}>
            {TYPE_LABEL[task.type]}
          </span>
          {task.due_date && (
            <span
              className={`text-xs ${
                overdue
                  ? "text-rose-400"
                  : today
                    ? "text-accent"
                    : "text-muted-foreground"
              }`}
            >
              {new Date(task.due_date).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          )}
          {task.priority === "high" && !done && (
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary ring-1 ring-primary/30">
              High
            </span>
          )}
        </div>
        <div className={`font-medium mt-1 ${done ? "line-through" : ""}`}>{task.title}</div>
        {task.description && (
          <div className="text-sm text-muted-foreground mt-1 line-clamp-2 whitespace-pre-wrap">
            {task.description}
          </div>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {task.contact && (
            <Link href={`/contacts/${task.contact.id}`} className="hover:text-primary">
              {task.contact.first_name} {task.contact.last_name ?? ""}
            </Link>
          )}
          {task.deal && (
            <Link href="/pipeline" className="hover:text-primary">
              {task.deal.title}
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button variant="ghost" size="icon" className="size-7">
                <Pencil className="size-3.5" />
              </Button>
            }
          />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit task</DialogTitle>
            </DialogHeader>
            <TaskForm
              action={updateAction}
              initial={task}
              contacts={contacts}
              deals={deals}
              submitLabel="Save changes"
              onSuccess={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-destructive"
          onClick={() => startTransition(() => deleteTask(task.id))}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
