import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Building2, Briefcase, Tag, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/contacts/status-badge";
import { EditContactDialog } from "@/components/contacts/edit-contact-dialog";
import { DeleteContactButton } from "@/components/contacts/delete-contact-button";
import { NoteForm } from "@/components/contacts/note-form";
import { Button } from "@/components/ui/button";
import type { Contact, ContactNote } from "@/lib/contacts/types";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .maybeSingle<Contact>();

  if (!contact) notFound();

  const { data: notes = [] } = await supabase
    .from("contact_notes")
    .select("*")
    .eq("contact_id", id)
    .order("created_at", { ascending: false })
    .returns<ContactNote[]>();

  const fullName = `${contact.first_name} ${contact.last_name ?? ""}`.trim();
  const initials = (contact.first_name[0] + (contact.last_name?.[0] ?? "")).toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/contacts"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="size-3.5" />
          All contacts
        </Link>
      </div>

      <div className="flex items-start gap-4 flex-wrap">
        <div className="size-14 rounded-xl bg-primary/15 ring-1 ring-primary/40 flex items-center justify-center">
          <span className="text-xl font-semibold text-primary">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-semibold tracking-tight">{fullName}</h1>
            <StatusBadge status={contact.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {contact.job_title ? `${contact.job_title}` : ""}
            {contact.job_title && contact.company ? " at " : ""}
            {contact.company ?? ""}
            {!contact.job_title && !contact.company && "No company set"}
          </p>
        </div>
        <div className="flex gap-2">
          <EditContactDialog contact={contact} />
          <DeleteContactButton id={contact.id} name={fullName} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card/60 border-border/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DetailRow icon={Mail} label="Email">
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="hover:text-primary">
                  {contact.email}
                </a>
              ) : (
                "—"
              )}
            </DetailRow>
            <DetailRow icon={Phone} label="Phone">
              {contact.phone ?? "—"}
            </DetailRow>
            <DetailRow icon={Building2} label="Company">
              {contact.company ?? "—"}
            </DetailRow>
            <DetailRow icon={Briefcase} label="Title">
              {contact.job_title ?? "—"}
            </DetailRow>
            <DetailRow icon={Tag} label="Source">
              {contact.source ?? "—"}
            </DetailRow>
            <DetailRow icon={Calendar} label="Added">
              {new Date(contact.created_at).toLocaleDateString()}
            </DetailRow>
            {contact.tags.length > 0 && (
              <div className="pt-2 border-t border-border/40">
                <div className="text-xs text-muted-foreground mb-2">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground ring-1 ring-border/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card/60 border-border/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base">Notes & timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NoteForm contactId={contact.id} />

            {notes && notes.length > 0 ? (
              <ol className="relative border-l border-border/60 pl-4 space-y-4">
                {notes.map((n) => (
                  <li key={n.id} className="relative">
                    <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-primary ring-2 ring-background" />
                    <div className="text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                    <div className="mt-1 whitespace-pre-wrap text-sm">{n.body}</div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 text-muted-foreground shrink-0" />
      <div className="flex-1 flex items-center justify-between gap-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground/90 text-right">{children}</span>
      </div>
    </div>
  );
}
