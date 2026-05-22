import Link from "next/link";
import { Search, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewContactDialog } from "@/components/contacts/new-contact-dialog";
import { StatusBadge } from "@/components/contacts/status-badge";
import type { Contact } from "@/lib/contacts/types";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (q && q.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(
      `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},company.ilike.${term}`,
    );
  }

  const { data: contacts = [], error } = await query.returns<Contact[]>();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            People you&apos;re tracking. {contacts?.length ?? 0} total.
          </p>
        </div>
        <NewContactDialog />
      </div>

      <form className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name, email, company…"
          className="pl-9"
        />
      </form>

      {error && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="py-4 text-sm text-destructive">{error.message}</CardContent>
        </Card>
      )}

      {!error && (!contacts || contacts.length === 0) ? (
        <Card className="bg-card/60 border-border/60 backdrop-blur-xl">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center gap-3">
            <div className="size-12 rounded-full bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">No contacts yet</p>
              <p className="text-sm text-muted-foreground">
                {q ? "No matches for your search." : "Add your first contact to get started."}
              </p>
            </div>
            {!q && <NewContactDialog />}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/60 border-border/60 backdrop-blur-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(contacts ?? []).map((c) => (
                <TableRow key={c.id} className="cursor-pointer">
                  <TableCell className="font-medium">
                    <Link href={`/contacts/${c.id}`} className="hover:text-primary">
                      {c.first_name} {c.last_name ?? ""}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.company ?? "—"}
                    {c.job_title ? (
                      <span className="text-xs block text-muted-foreground/70">
                        {c.job_title}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.email ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {c.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-xs px-1.5 py-0.5 rounded-md bg-muted/40 text-muted-foreground ring-1 ring-border/60"
                        >
                          {t}
                        </span>
                      ))}
                      {c.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{c.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
