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
import { STAGES, type Deal, type DealStage } from "@/lib/deals/types";
import type { DealFormState } from "@/app/(app)/pipeline/actions";

type ContactOption = { id: string; first_name: string; last_name: string | null };

type Props = {
  action: (state: DealFormState, formData: FormData) => Promise<DealFormState>;
  initial?: Partial<Deal>;
  contacts: ContactOption[];
  submitLabel?: string;
  onSuccess?: () => void;
};

export function DealForm({ action, initial, contacts, submitLabel = "Save", onSuccess }: Props) {
  const [state, formAction, pending] = useActionState<DealFormState, FormData>(
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
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            name="value"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initial?.value ?? 0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            name="currency"
            maxLength={3}
            defaultValue={initial?.currency ?? "USD"}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <Select name="stage" defaultValue={(initial?.stage as DealStage) ?? "lead"}>
            <SelectTrigger id="stage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="expected_close_date">Expected close</Label>
          <Input
            id="expected_close_date"
            name="expected_close_date"
            type="date"
            defaultValue={initial?.expected_close_date ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_id">Contact</Label>
        <Select name="contact_id" defaultValue={initial?.contact_id ?? "none"}>
          <SelectTrigger id="contact_id">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— No contact —</SelectItem>
            {contacts.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.first_name} {c.last_name ?? ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
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
