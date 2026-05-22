"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskForm } from "./task-form";
import { createTask } from "@/app/(app)/tasks/actions";

type ContactOption = { id: string; first_name: string; last_name: string | null };
type DealOption = { id: string; title: string };

export function NewTaskDialog({
  contacts,
  deals,
  defaultContactId,
  defaultDealId,
  triggerLabel = "New task",
}: {
  contacts: ContactOption[];
  deals: DealOption[];
  defaultContactId?: string;
  defaultDealId?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" />
            {triggerLabel}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        <TaskForm
          action={createTask}
          contacts={contacts}
          deals={deals}
          initial={{
            contact_id: defaultContactId ?? null,
            deal_id: defaultDealId ?? null,
          }}
          submitLabel="Create task"
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
