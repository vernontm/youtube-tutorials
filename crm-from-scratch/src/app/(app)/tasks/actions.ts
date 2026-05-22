"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TaskPriority, TaskType } from "@/lib/tasks/types";

export type TaskFormState = { error?: string; ok?: boolean } | undefined;

function readForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const type = (String(formData.get("type") ?? "follow_up") as TaskType) || "follow_up";
  const priority = (String(formData.get("priority") ?? "normal") as TaskPriority) || "normal";
  const dueRaw = String(formData.get("due_date") ?? "").trim();
  const due_date = dueRaw ? new Date(dueRaw).toISOString() : null;
  const contactRaw = String(formData.get("contact_id") ?? "").trim();
  const contact_id = contactRaw && contactRaw !== "none" ? contactRaw : null;
  const dealRaw = String(formData.get("deal_id") ?? "").trim();
  const deal_id = dealRaw && dealRaw !== "none" ? dealRaw : null;
  return { title, description, type, priority, due_date, contact_id, deal_id };
}

export async function createTask(_: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const payload = readForm(formData);
  if (!payload.title) return { error: "Title is required." };

  const { error } = await supabase.from("tasks").insert({ ...payload, user_id: user.id });
  if (error) return { error: error.message };

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (payload.contact_id) revalidatePath(`/contacts/${payload.contact_id}`);
  return { ok: true };
}

export async function updateTask(
  id: string,
  _: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const supabase = await createClient();
  const payload = readForm(formData);
  if (!payload.title) return { error: "Title is required." };

  const { error } = await supabase.from("tasks").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/tasks");
  return { ok: true };
}

export async function toggleTaskComplete(id: string, isComplete: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ completed_at: isComplete ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
}
