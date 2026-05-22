"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DealForm } from "./deal-form";
import { createDeal } from "@/app/(app)/pipeline/actions";

type ContactOption = { id: string; first_name: string; last_name: string | null };

export function NewDealDialog({ contacts }: { contacts: ContactOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" />
            New deal
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New deal</DialogTitle>
          <DialogDescription>Add a new opportunity to your pipeline.</DialogDescription>
        </DialogHeader>
        <DealForm
          action={createDeal}
          contacts={contacts}
          submitLabel="Create deal"
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
