import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, type ContactStatus } from "@/lib/contacts/types";

const STYLES: Record<ContactStatus, string> = {
  lead: "bg-primary/15 text-primary ring-1 ring-primary/30",
  customer: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
  partner: "bg-accent/20 text-accent ring-1 ring-accent/30",
  other: "bg-muted/40 text-muted-foreground ring-1 ring-border/60",
};

export function StatusBadge({ status }: { status: ContactStatus }) {
  return (
    <Badge variant="outline" className={`border-transparent ${STYLES[status]}`}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
