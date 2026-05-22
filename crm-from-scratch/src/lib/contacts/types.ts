export type ContactStatus = "lead" | "customer" | "partner" | "other";

export type Contact = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  status: ContactStatus;
  source: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type ContactNote = {
  id: string;
  user_id: string;
  contact_id: string;
  body: string;
  created_at: string;
};

export const STATUS_LABEL: Record<ContactStatus, string> = {
  lead: "Lead",
  customer: "Customer",
  partner: "Partner",
  other: "Other",
};
