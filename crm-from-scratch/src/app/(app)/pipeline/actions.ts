"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DealStage } from "@/lib/deals/types";

export type DealFormState = { error?: string; ok?: boolean } | undefined;

function readForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const valueRaw = String(formData.get("value") ?? "0").replace(/[^0-9.-]/g, "");
  const value = Number.parseFloat(valueRaw || "0");
  const currency = String(formData.get("currency") ?? "USD").trim() || "USD";
  const stage = (String(formData.get("stage") ?? "lead") as DealStage) || "lead";
  const expectedClose = String(formData.get("expected_close_date") ?? "").trim();
  const expected_close_date = expectedClose || null;
  const contactRaw = String(formData.get("contact_id") ?? "").trim();
  const contact_id = contactRaw && contactRaw !== "none" ? contactRaw : null;
  return { title, description, value, currency, stage, expected_close_date, contact_id };
}

export async function createDeal(_: DealFormState, formData: FormData): Promise<DealFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const payload = readForm(formData);
  if (!payload.title) return { error: "Title is required." };
  if (Number.isNaN(payload.value)) return { error: "Value must be a number." };

  // Append to the end of the target stage column.
  const { data: last } = await supabase
    .from("deals")
    .select("position")
    .eq("user_id", user.id)
    .eq("stage", payload.stage)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle<{ position: number }>();

  const position = (last?.position ?? -1) + 1;

  const { error } = await supabase
    .from("deals")
    .insert({ ...payload, position, user_id: user.id });
  if (error) return { error: error.message };

  revalidatePath("/pipeline");
  return { ok: true };
}

export async function updateDeal(
  id: string,
  _: DealFormState,
  formData: FormData,
): Promise<DealFormState> {
  const supabase = await createClient();
  const payload = readForm(formData);
  if (!payload.title) return { error: "Title is required." };

  const { error } = await supabase.from("deals").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/pipeline");
  return { ok: true };
}

export async function deleteDeal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("deals").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/pipeline");
}

// Called after a drag-and-drop reorder. We send the new stage + the full
// ordered list of deal ids for that stage so we can update positions in one pass.
export async function moveDeal(args: {
  dealId: string;
  toStage: DealStage;
  orderedIds: string[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");

  // Set stage on the moved deal.
  const { error: stageErr } = await supabase
    .from("deals")
    .update({ stage: args.toStage })
    .eq("id", args.dealId);
  if (stageErr) throw new Error(stageErr.message);

  // Rewrite positions for every deal in the destination column.
  const updates = args.orderedIds.map((id, position) =>
    supabase.from("deals").update({ position }).eq("id", id),
  );
  const results = await Promise.all(updates);
  const firstErr = results.find((r) => r.error)?.error;
  if (firstErr) throw new Error(firstErr.message);

  revalidatePath("/pipeline");
}
