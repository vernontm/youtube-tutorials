export type DealStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type Deal = {
  id: string;
  user_id: string;
  contact_id: string | null;
  title: string;
  description: string | null;
  value: number;
  currency: string;
  stage: DealStage;
  expected_close_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type DealWithContact = Deal & {
  contact: { id: string; first_name: string; last_name: string | null; company: string | null } | null;
};

export const STAGES: { key: DealStage; label: string; tone: string }[] = [
  { key: "lead", label: "Lead", tone: "text-muted-foreground" },
  { key: "qualified", label: "Qualified", tone: "text-sky-400" },
  { key: "proposal", label: "Proposal", tone: "text-accent" },
  { key: "negotiation", label: "Negotiation", tone: "text-primary" },
  { key: "won", label: "Won", tone: "text-emerald-400" },
  { key: "lost", label: "Lost", tone: "text-rose-400" },
];

export const STAGE_LABEL: Record<DealStage, string> = Object.fromEntries(
  STAGES.map((s) => [s.key, s.label]),
) as Record<DealStage, string>;

export function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
