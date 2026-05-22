import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { KanbanSquare } from "lucide-react";
import { NewDealDialog } from "@/components/deals/new-deal-dialog";
import { PipelineBoard } from "@/components/deals/pipeline-board";
import { formatMoney, type DealWithContact } from "@/lib/deals/types";

export default async function PipelinePage() {
  const supabase = await createClient();

  const [{ data: deals = [], error }, { data: contacts = [] }] = await Promise.all([
    supabase
      .from("deals")
      .select(
        "id, user_id, contact_id, title, description, value, currency, stage, expected_close_date, position, created_at, updated_at, contact:contacts(id, first_name, last_name, company)",
      )
      .order("position", { ascending: true })
      .returns<DealWithContact[]>(),
    supabase
      .from("contacts")
      .select("id, first_name, last_name")
      .order("first_name"),
  ]);

  const openValue = (deals ?? [])
    .filter((d) => d.stage !== "won" && d.stage !== "lost")
    .reduce((sum, d) => sum + Number(d.value || 0), 0);
  const wonValue = (deals ?? [])
    .filter((d) => d.stage === "won")
    .reduce((sum, d) => sum + Number(d.value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {(deals ?? []).length} deals · {formatMoney(openValue)} open ·{" "}
            <span className="text-emerald-400">{formatMoney(wonValue)} won</span>
          </p>
        </div>
        <NewDealDialog contacts={contacts ?? []} />
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="py-4 text-sm text-destructive">{error.message}</CardContent>
        </Card>
      )}

      {!error && (!deals || deals.length === 0) ? (
        <Card className="bg-card/60 border-border/60 backdrop-blur-xl">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center gap-3">
            <div className="size-12 rounded-full bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center">
              <KanbanSquare className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">No deals yet</p>
              <p className="text-sm text-muted-foreground">
                Add your first deal to start tracking your pipeline.
              </p>
            </div>
            <NewDealDialog contacts={contacts ?? []} />
          </CardContent>
        </Card>
      ) : (
        <PipelineBoard deals={deals ?? []} contacts={contacts ?? []} />
      )}
    </div>
  );
}
