"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addNote } from "@/app/(app)/contacts/actions";

export function NoteForm({ contactId }: { contactId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await addNote(contactId, fd);
        formRef.current?.reset();
      }}
      className="space-y-2"
    >
      <Textarea
        name="body"
        required
        placeholder="Add a note — call recap, next steps, anything…"
        rows={3}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm">
          Add note
        </Button>
      </div>
    </form>
  );
}
