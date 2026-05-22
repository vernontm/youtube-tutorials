"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DealForm } from "./deal-form";
import { updateDeal, deleteDeal, type DealFormState } from "@/app/(app)/pipeline/actions";
import type { DealWithContact } from "@/lib/deals/types";

type ContactOption = { id: string; first_name: string; last_name: string | null };

export function EditDealDialog({
  deal,
  contacts,
  trigger,
}: {
  deal: DealWithContact;
  contacts: ContactOption[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);

  const action = (state: DealFormState, fd: FormData) => updateDeal(deal.id, state, fd);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger nativeButton={false} render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit deal</DialogTitle>
        </DialogHeader>
        <DealForm
          action={action}
          initial={deal}
          contacts={contacts}
          submitLabel="Save changes"
          onSuccess={() => setOpen(false)}
        />
        <DialogFooter className="sm:justify-start">
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline" size="sm" className="text-destructive">
                  Delete deal
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this deal?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove &ldquo;{deal.title}&rdquo;.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <form
                  action={async () => {
                    await deleteDeal(deal.id);
                    setOpen(false);
                  }}
                >
                  <AlertDialogAction
                    render={
                      <button
                        type="submit"
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </button>
                    }
                  />
                </form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
