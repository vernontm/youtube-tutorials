"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ContactStatus } from "@/lib/contacts/types";

export type ContactFormState = { error?: string; ok?: boolean } | undefined;

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function readForm(formData: FormData) {
  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const company = String(formData.get("company") ?? "").trim() || null;
  const job_title = String(formData.get("job_title") ?? "").trim() || null;
  const source = String(formData.get("source") ?? "").trim() || null;
  const status = (String(formData.get("status") ?? "lead") as ContactStatus) || "lead";
  const tags = parseTags(String(formData.get("tags") ?? ""));
  return { first_name, last_name, email, phone, company, job_title, source, status, tags };
}

export async function createContact(_: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const payload = readForm(formData);
  if (!payload.first_name) return { error: "First name is required." };

  const { error } = await supabase.from("contacts").insert({ ...payload, user_id: user.id });
  if (error) return { error: error.message };

  revalidatePath("/contacts");
  return { ok: true };
}

export async function updateContact(id: string, _: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const supabase = await createClient();
  const payload = readForm(formData);
  if (!payload.first_name) return { error: "First name is required." };

  const { error } = await supabase.from("contacts").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
  return { ok: true };
}

export async function deleteContact(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/contacts");
  redirect("/contacts");
}

export async function addNote(contactId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const { error } = await supabase
    .from("contact_notes")
    .insert({ user_id: user.id, contact_id: contactId, body });
  if (error) throw new Error(error.message);

  revalidatePath(`/contacts/${contactId}`);
}

export async function deleteNote(noteId: string, contactId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("contact_notes").delete().eq("id", noteId);
  if (error) throw new Error(error.message);
  revalidatePath(`/contacts/${contactId}`);
}
