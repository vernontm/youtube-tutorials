"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRIORITY_LABEL,
  TYPE_LABEL,
  type Task,
  type TaskPriority,
  type TaskType,
} from "@/lib/tasks/types";
import type { TaskFormState } from "@/app/(app)/tasks/actions";

type ContactOption = { id: string; first_name: string; last_name: string | null };
type DealOption = { id: string; title: string };

type Props = {
  action: (state: TaskFormState, fd: FormData) => Promise<TaskFormState>;
  initial?: Partial<Task>;
  contacts: ContactOption[];
  deals: DealOption[];
  submitLabel?: string;
  onSuccess?: () => void;
};

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TaskForm({
  action,
  initial,
  contacts,
  deals,
  submitLabel = "Save",
  onSuccess,
}: Props) {
  const [state, formAction, pending] = useActionState<TaskFormState, FormData>(
    async (prev, fd) => {
      const result = await action(prev, fd);
      if (result?.ok) onSuccess?.();
      return result;
    },
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" required defaultValue={initial?.title ?? ""} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select name="type" defaultValue={(initial?.type as TaskType) ?? "follow_up"}>
            <SelectTrigger id="type" className="w-full">
              <SelectValue>{(v) => TYPE_LABEL[v as TaskType] ?? "—"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TYPE_LABEL) as TaskType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            name="priority"
            defaultValue={(initial?.priority as TaskPriority) ?? "normal"}
          >
            <SelectTrigger id="priority" className="w-full">
              <SelectValue>{(v) => PRIORITY_LABEL[v as TaskPriority] ?? "—"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date">Due</Label>
        <Input
          id="due_date"
          name="due_date"
          type="datetime-local"
          defaultValue={toLocalInput(initial?.due_date)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="contact_id">Contact</Label>
          <Select name="contact_id" defaultValue={initial?.contact_id ?? "none"}>
            <SelectTrigger id="contact_id" className="w-full">
              <SelectValue>
                {(v) => {
                  if (!v || v === "none") return "— None —";
                  const c = contacts.find((x) => x.id === v);
                  return c ? `${c.first_name} ${c.last_name ?? ""}`.trim() : "— None —";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— None —</SelectItem>
              {contacts.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.first_name} {c.last_name ?? ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deal_id">Deal</Label>
          <Select name="deal_id" defaultValue={initial?.deal_id ?? "none"}>
            <SelectTrigger id="deal_id" className="w-full">
              <SelectValue>
                {(v) => {
                  if (!v || v === "none") return "— None —";
                  const d = deals.find((x) => x.id === v);
                  return d ? d.title : "— None —";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— None —</SelectItem>
              {deals.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Notes</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={initial?.description ?? ""} />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
