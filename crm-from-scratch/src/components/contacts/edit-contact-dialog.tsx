"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContactForm } from "./contact-form";
import { updateContact, type ContactFormState } from "@/app/(app)/contacts/actions";
import type { Contact } from "@/lib/contacts/types";

export function EditContactDialog({ contact }: { contact: Contact }) {
  const [open, setOpen] = useState(false);

  const action = (state: ContactFormState, fd: FormData) => updateContact(contact.id, state, fd);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Pencil className="size-3.5" />
            Edit
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit contact</DialogTitle>
        </DialogHeader>
        <ContactForm
          action={action}
          initial={contact}
          submitLabel="Save changes"
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
