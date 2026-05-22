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
import type { Contact, ContactStatus } from "@/lib/contacts/types";
import { STATUS_LABEL } from "@/lib/contacts/types";
import type { ContactFormState } from "@/app/(app)/contacts/actions";

type Props = {
  action: (state: ContactFormState, formData: FormData) => Promise<ContactFormState>;
  initial?: Partial<Contact>;
  submitLabel?: string;
  onSuccess?: () => void;
};

export function ContactForm({ action, initial, submitLabel = "Save", onSuccess }: Props) {
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(
    async (prev, formData) => {
      const result = await action(prev, formData);
      if (result?.ok) onSuccess?.();
      return result;
    },
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="first_name">First name *</Label>
          <Input id="first_name" name="first_name" required defaultValue={initial?.first_name ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last name</Label>
          <Input id="last_name" name="last_name" defaultValue={initial?.last_name ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={initial?.email ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={initial?.phone ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" defaultValue={initial?.company ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job_title">Job title</Label>
          <Input id="job_title" name="job_title" defaultValue={initial?.job_title ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={(initial?.status as ContactStatus) ?? "lead"}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue>
                {(v) => STATUS_LABEL[v as ContactStatus] ?? "—"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_LABEL) as ContactStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Input id="source" name="source" placeholder="Referral, LinkedIn, …" defaultValue={initial?.source ?? ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Textarea
          id="tags"
          name="tags"
          rows={2}
          placeholder="comma, separated, tags"
          defaultValue={(initial?.tags ?? []).join(", ")}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
