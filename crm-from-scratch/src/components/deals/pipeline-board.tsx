"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, GripVertical, User } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { moveDeal } from "@/app/(app)/pipeline/actions";
import {
  STAGES,
  formatMoney,
  type DealStage,
  type DealWithContact,
} from "@/lib/deals/types";
import { EditDealDialog } from "./edit-deal-dialog";

type ContactOption = { id: string; first_name: string; last_name: string | null };

type ColumnsState = Record<DealStage, DealWithContact[]>;

function bucketize(deals: DealWithContact[]): ColumnsState {
  const empty: ColumnsState = {
    lead: [],
    qualified: [],
    proposal: [],
    negotiation: [],
    won: [],
    lost: [],
  };
  for (const d of deals) empty[d.stage].push(d);
  for (const k of Object.keys(empty) as DealStage[]) {
    empty[k].sort((a, b) => a.position - b.position);
  }
  return empty;
}

export function PipelineBoard({
  deals,
  contacts,
}: {
  deals: DealWithContact[];
  contacts: ContactOption[];
}) {
  const [columns, setColumns] = useState<ColumnsState>(() => bucketize(deals));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const activeDeal = useMemo(() => {
    if (!activeId) return null;
    for (const stage of STAGES) {
      const found = columns[stage.key].find((d) => d.id === activeId);
      if (found) return found;
    }
    return null;
  }, [activeId, columns]);

  function findStageOf(id: string): DealStage | null {
    for (const stage of STAGES) {
      if (columns[stage.key].some((d) => d.id === id)) return stage.key;
    }
    return null;
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const fromStage = findStageOf(activeId);
    if (!fromStage) return;

    const toStage = (STAGES.find((s) => s.key === overId)?.key ?? findStageOf(overId)) as
      | DealStage
      | null;
    if (!toStage || fromStage === toStage) return;

    // Moving between columns: pull from source, append to destination.
    setColumns((prev) => {
      const fromList = prev[fromStage];
      const toList = prev[toStage];
      const moving = fromList.find((d) => d.id === activeId);
      if (!moving) return prev;
      return {
        ...prev,
        [fromStage]: fromList.filter((d) => d.id !== activeId),
        [toStage]: [...toList, { ...moving, stage: toStage }],
      };
    });
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const stage = findStageOf(activeId);
    if (!stage) return;

    let nextColumns = columns;
    // Reorder within the same column when dropped on a sibling.
    if (activeId !== overId) {
      const inSameColumn = columns[stage].some((d) => d.id === overId);
      if (inSameColumn) {
        const list = columns[stage];
        const oldIndex = list.findIndex((d) => d.id === activeId);
        const newIndex = list.findIndex((d) => d.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          nextColumns = {
            ...columns,
            [stage]: arrayMove(list, oldIndex, newIndex),
          };
          setColumns(nextColumns);
        }
      }
    }

    const orderedIds = nextColumns[stage].map((d) => d.id);

    startTransition(async () => {
      try {
        await moveDeal({ dealId: activeId, toStage: stage, orderedIds });
      } catch (err) {
        toast.error("Failed to save move. Reload to resync.");
        console.error(err);
      }
    });
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {STAGES.map((s) => (
          <Column key={s.key} stage={s.key} label={s.label} tone={s.tone} deals={columns[s.key]} contacts={contacts} />
        ))}
      </div>
      <DragOverlay modifiers={[snapCenterToCursor]}>
        {activeDeal ? <DealCardView deal={activeDeal} dragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  stage,
  label,
  tone,
  deals,
  contacts,
}: {
  stage: DealStage;
  label: string;
  tone: string;
  deals: DealWithContact[];
  contacts: ContactOption[];
}) {
  const total = deals.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border border-border/60 bg-card/40 backdrop-blur-xl min-h-[60vh] ${
        isOver ? "ring-1 ring-primary/40" : ""
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold uppercase tracking-wider ${tone}`}>{label}</span>
          <span className="text-xs text-muted-foreground">{deals.length}</span>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatMoney(total)}
        </span>
      </div>

      <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 p-2 space-y-2">
          {deals.map((d) => (
            <SortableDealCard key={d.id} deal={d} contacts={contacts} />
          ))}
          {deals.length === 0 && (
            <div className="text-xs text-muted-foreground/60 text-center py-4">
              Drop deals here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableDealCard({
  deal,
  contacts,
}: {
  deal: DealWithContact;
  contacts: ContactOption[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <EditDealDialog
        deal={deal}
        contacts={contacts}
        trigger={
          <div className="group">
            <DealCardView deal={deal} dragHandleProps={{ ...attributes, ...listeners }} />
          </div>
        }
      />
    </div>
  );
}

function DealCardView({
  deal,
  dragging = false,
  dragHandleProps,
}: {
  deal: DealWithContact;
  dragging?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandleProps?: any;
}) {
  return (
    <Card
      className={`p-3 bg-card/80 border-border/60 hover:border-primary/40 transition-colors cursor-pointer ${
        dragging ? "shadow-2xl ring-1 ring-primary/40" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...dragHandleProps}
          onClick={(e) => e.stopPropagation()}
          className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing pt-0.5"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="font-medium text-sm leading-snug line-clamp-2">{deal.title}</div>
          <div className="text-lg font-semibold text-primary tabular-nums">
            {formatMoney(Number(deal.value), deal.currency)}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {deal.contact && (
              <Link
                href={`/contacts/${deal.contact.id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 hover:text-primary"
              >
                <User className="size-3" />
                {deal.contact.first_name} {deal.contact.last_name ?? ""}
              </Link>
            )}
            {deal.expected_close_date && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3" />
                {new Date(deal.expected_close_date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
