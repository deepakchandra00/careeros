"use client";

import * as React from "react";
import {
  User,
  FileText,
  Briefcase,
  Sparkles,
  FolderGit2,
  GraduationCap,
  Award,
  Globe,
  Trophy,
  BookOpen,
  Heart,
  Users,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  Minimize2,
  Maximize2,
  Wand2,
  Loader2,
  X,
  Upload,
  Layers,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useResumeStore,
  type ResumeData,
  type ExperienceItem,
  type ProjectItem,
  type EducationItem,
  type SimpleItem,
  type ReferenceItem,
  type CustomSection,
  type SectionId,
} from "@/store/resume-store";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type IconType = React.ComponentType<{ className?: string }>;
type RewriteAction = "improve" | "shorten" | "expand" | "rewrite";
type SimpleKey = "certifications" | "awards" | "publications";
type TagKey = "languages" | "interests";

const AI_ACTIONS: { key: RewriteAction; icon: IconType; label: string }[] = [
  { key: "improve", icon: Sparkles, label: "Improve" },
  { key: "shorten", icon: Minimize2, label: "Shorten" },
  { key: "expand", icon: Maximize2, label: "Expand" },
  { key: "rewrite", icon: Wand2, label: "Rewrite" },
];

// ---------- Reusable helpers ----------

function SectionCard({
  id,
  icon: Icon,
  title,
  count,
  defaultOpen = false,
  children,
}: {
  id: SectionId | "custom";
  icon: IconType;
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Collapsible
      data-section={id}
      defaultOpen={defaultOpen}
      className="group rounded-xl border bg-card"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-xl p-3 text-left transition-colors hover:bg-accent/40"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <span className="flex-1 text-sm font-semibold">{title}</span>
          {typeof count === "number" && count > 0 && (
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold tabular-nums text-primary">
              {count}
            </span>
          )}
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              "group-data-[state=open]:rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Separator />
        <div className="space-y-3 p-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = React.useState("");

  const commit = React.useCallback(
    (raw: string) => {
      const parts = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length === 0) return;
      const seen = new Set(values.map((v) => v.toLowerCase()));
      const next = [...values];
      for (const p of parts) {
        if (!seen.has(p.toLowerCase())) {
          next.push(p);
          seen.add(p.toLowerCase());
        }
      }
      onChange(next);
      setInput("");
    },
    [values, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(input);
    } else if (e.key === "Backspace" && input === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (text.includes(",")) {
      e.preventDefault();
      commit(text);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-background px-1.5 py-1.5">
      {values.map((v, i) => (
        <span
          key={`${v}-${i}`}
          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary"
        >
          {v}
          <button
            type="button"
            onClick={() => onChange(values.filter((_, idx) => idx !== i))}
            className="text-primary/60 transition-colors hover:text-primary"
            aria-label={`Remove ${v}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => {
          if (input.trim()) commit(input);
        }}
        placeholder={values.length === 0 ? placeholder : "Add…"}
        className="min-w-[80px] flex-1 border-0 bg-transparent p-1 text-xs outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

function AIActionButtons({
  text,
  context,
  onResult,
  onMultiResult,
}: {
  text: string;
  context?: string;
  onResult: (result: string) => void;
  onMultiResult?: (lines: string[]) => void;
}) {
  const [loading, setLoading] = React.useState<RewriteAction | null>(null);

  const run = async (action: RewriteAction) => {
    if (loading) return;
    if (!text.trim()) {
      toast.error("Nothing to rewrite");
      return;
    }
    setLoading(action);
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, action, context }),
      });
      const json = (await res.json()) as { result?: string; error?: string };
      if (!res.ok) throw new Error(json.error || "AI request failed");
      const result = (json.result ?? "").trim();
      if (!result) {
        toast.error("AI returned empty content");
        return;
      }
      if (action === "expand" && onMultiResult) {
        const lines = result
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length === 0) {
          toast.error("AI returned no content");
          return;
        }
        onMultiResult(lines);
      } else {
        onResult(result);
      }
      toast.success(`${action[0].toUpperCase()}${action.slice(1)}d`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI rewrite failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      <span className="mr-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        AI
      </span>
      {AI_ACTIONS.map(({ key, icon: Icon, label }) => (
        <Button
          key={key}
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-primary hover:bg-primary/10"
          onClick={() => run(key)}
          disabled={!!loading}
          aria-label={label}
          title={label}
        >
          {loading === key ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Icon className="size-3.5" />
          )}
        </Button>
      ))}
    </div>
  );
}

function IconButtonRow({
  onDuplicate,
  onDelete,
  duplicateLabel = "Duplicate",
  deleteLabel = "Delete",
}: {
  onDuplicate?: () => void;
  onDelete: () => void;
  duplicateLabel?: string;
  deleteLabel?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {onDuplicate && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground hover:bg-accent"
          onClick={onDuplicate}
        >
          <Copy className="size-3.5" /> {duplicateLabel}
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1 text-destructive hover:bg-destructive/10"
        onClick={onDelete}
      >
        <Trash2 className="size-3.5" /> {deleteLabel}
      </Button>
    </div>
  );
}

function AddButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full gap-1.5 border-dashed"
      onClick={onClick}
    >
      <Plus className="size-3.5" /> {label}
    </Button>
  );
}

// ---------- Drag-and-drop wrapper ----------

/**
 * Wraps any entry card with a left-side drag handle. The handle receives
 * `attributes` + `listeners` from `useSortable`, so only the handle initiates
 * a drag — the rest of the card stays fully interactive (inputs, buttons).
 */
function SortableEntry({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
      className="flex gap-1.5"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="mt-3 flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/**
 * Build a drag-end handler that maps @dnd-kit's active/over ids to numeric
 * indices and calls a `move(fromIdx, toIdx)` store action.
 */
function makeDragEndHandler<T extends { id: string }>(
  items: T[],
  move: (fromIdx: number, toIdx: number) => void
) {
  return (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const oldIndex = items.findIndex((i) => i.id === activeId);
    const newIndex = items.findIndex((i) => i.id === overId);
    if (oldIndex >= 0 && newIndex >= 0) {
      move(oldIndex, newIndex);
    }
  };
}

// ---------- Entry cards ----------

function ExperienceEntryCard({ exp }: { exp: ExperienceItem }) {
  const updateBullet = useResumeStore((s) => s.updateBullet);
  const addBullet = useResumeStore((s) => s.addBullet);
  const removeBullet = useResumeStore((s) => s.removeBullet);
  const updateExperience = useResumeStore((s) => s.updateExperience);
  const removeExperience = useResumeStore((s) => s.removeExperience);
  const duplicateExperience = useResumeStore((s) => s.duplicateExperience);

  const handleMultiBullet = (idx: number, lines: string[]) => {
    const next = [...exp.bullets];
    next.splice(idx, 1, ...lines);
    updateExperience(exp.id, { bullets: next });
  };

  return (
    <div className="space-y-2.5 rounded-lg border bg-background/60 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Role">
          <Input
            className="h-9 text-sm"
            value={exp.role}
            onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
            placeholder="Senior Engineer"
          />
        </Field>
        <Field label="Company">
          <Input
            className="h-9 text-sm"
            value={exp.company}
            onChange={(e) =>
              updateExperience(exp.id, { company: e.target.value })
            }
            placeholder="Acme Inc."
          />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Location">
          <Input
            className="h-9 text-sm"
            value={exp.location}
            onChange={(e) =>
              updateExperience(exp.id, { location: e.target.value })
            }
            placeholder="Bengaluru"
          />
        </Field>
        <Field label="Start">
          <Input
            className="h-9 text-sm"
            value={exp.start}
            onChange={(e) =>
              updateExperience(exp.id, { start: e.target.value })
            }
            placeholder="2022"
          />
        </Field>
        <Field label="End">
          <Input
            className="h-9 text-sm"
            value={exp.end}
            onChange={(e) => updateExperience(exp.id, { end: e.target.value })}
            placeholder="Present"
          />
        </Field>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Bullets
        </Label>
        <div className="space-y-2">
          {exp.bullets.length === 0 && (
            <p className="rounded-md border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              No bullets yet — add your first achievement.
            </p>
          )}
          {exp.bullets.map((b, idx) => (
            <div
              key={`${exp.id}-b-${idx}`}
              className="space-y-1.5 rounded-md border bg-card p-2"
            >
              <Textarea
                rows={2}
                value={b}
                onChange={(e) => updateBullet(exp.id, idx, e.target.value)}
                className="min-h-[52px] resize-none text-sm"
                placeholder="What did you achieve?"
              />
              <div className="flex items-center justify-between">
                <AIActionButtons
                  text={b}
                  context={`${exp.role} at ${exp.company}`}
                  onResult={(r) => updateBullet(exp.id, idx, r)}
                  onMultiResult={(lines) => handleMultiBullet(idx, lines)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => removeBullet(exp.id, idx)}
                  aria-label="Remove bullet"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1 text-primary hover:bg-primary/10"
          onClick={() => addBullet(exp.id)}
        >
          <Plus className="size-3.5" /> Add bullet
        </Button>
        <IconButtonRow
          onDuplicate={() => duplicateExperience(exp.id)}
          onDelete={() => removeExperience(exp.id)}
        />
      </div>
    </div>
  );
}

function ProjectEntryCard({ project }: { project: ProjectItem }) {
  const updateProject = useResumeStore((s) => s.updateProject);
  const removeProject = useResumeStore((s) => s.removeProject);
  const update = useResumeStore((s) => s.update);
  const projects = useResumeStore((s) => s.data.projects);

  const duplicate = () => {
    const idx = projects.findIndex((p) => p.id === project.id);
    if (idx === -1) return;
    const copy: ProjectItem = {
      ...project,
      id: Math.random().toString(36).slice(2, 10),
      tech: [...project.tech],
    };
    const next = [...projects];
    next.splice(idx + 1, 0, copy);
    update({ projects: next });
    toast.success("Project duplicated");
  };

  return (
    <div className="space-y-2.5 rounded-lg border bg-background/60 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Project name">
          <Input
            className="h-9 text-sm"
            value={project.name}
            onChange={(e) =>
              updateProject(project.id, { name: e.target.value })
            }
            placeholder="DevMetrics"
          />
        </Field>
        <Field label="Link">
          <Input
            className="h-9 text-sm"
            value={project.link}
            onChange={(e) =>
              updateProject(project.id, { link: e.target.value })
            }
            placeholder="github.com/…"
          />
        </Field>
      </div>
      <Field label="Description">
        <Textarea
          rows={2}
          value={project.description}
          onChange={(e) =>
            updateProject(project.id, { description: e.target.value })
          }
          className="min-h-[52px] resize-none text-sm"
          placeholder="What it does and your impact."
        />
        <AIActionButtons
          text={project.description}
          onResult={(r) => updateProject(project.id, { description: r })}
          onMultiResult={(lines) =>
            updateProject(project.id, { description: lines.join("\n") })
          }
        />
      </Field>
      <Field label="Tech stack">
        <TagInput
          values={project.tech}
          onChange={(t) => updateProject(project.id, { tech: t })}
          placeholder="React, Next.js…"
        />
      </Field>
      <div className="flex justify-end pt-0.5">
        <IconButtonRow
          onDuplicate={duplicate}
          onDelete={() => removeProject(project.id)}
        />
      </div>
    </div>
  );
}

function EducationEntryCard({ edu }: { edu: EducationItem }) {
  const updateEducation = useResumeStore((s) => s.updateEducation);
  const removeEducation = useResumeStore((s) => s.removeEducation);

  return (
    <div className="space-y-2.5 rounded-lg border bg-background/60 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Degree" className="col-span-2">
          <Input
            className="h-9 text-sm"
            value={edu.degree}
            onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
            placeholder="B.Tech, Computer Science"
          />
        </Field>
        <Field label="School">
          <Input
            className="h-9 text-sm"
            value={edu.school}
            onChange={(e) =>
              updateEducation(edu.id, { school: e.target.value })
            }
            placeholder="BITS Pilani"
          />
        </Field>
        <Field label="Location">
          <Input
            className="h-9 text-sm"
            value={edu.location}
            onChange={(e) =>
              updateEducation(edu.id, { location: e.target.value })
            }
            placeholder="Pilani"
          />
        </Field>
        <Field label="Start">
          <Input
            className="h-9 text-sm"
            value={edu.start}
            onChange={(e) => updateEducation(edu.id, { start: e.target.value })}
            placeholder="2015"
          />
        </Field>
        <Field label="End">
          <Input
            className="h-9 text-sm"
            value={edu.end}
            onChange={(e) => updateEducation(edu.id, { end: e.target.value })}
            placeholder="2019"
          />
        </Field>
        <Field label="Grade" className="col-span-2">
          <Input
            className="h-9 text-sm"
            value={edu.grade}
            onChange={(e) => updateEducation(edu.id, { grade: e.target.value })}
            placeholder="8.7 CGPA"
          />
        </Field>
      </div>
      <div className="flex justify-end pt-0.5">
        <IconButtonRow onDelete={() => removeEducation(edu.id)} />
      </div>
    </div>
  );
}

function SimpleEntryCard({
  item,
  keyName,
  subtitleLabel,
}: {
  item: SimpleItem;
  keyName: SimpleKey;
  subtitleLabel: string;
}) {
  const updateSimple = useResumeStore((s) => s.updateSimple);
  const removeSimple = useResumeStore((s) => s.removeSimple);

  return (
    <div className="space-y-2.5 rounded-lg border bg-background/60 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Title">
          <Input
            className="h-9 text-sm"
            value={item.title}
            onChange={(e) =>
              updateSimple(keyName, item.id, { title: e.target.value })
            }
            placeholder="Title"
          />
        </Field>
        <Field label={subtitleLabel}>
          <Input
            className="h-9 text-sm"
            value={item.subtitle}
            onChange={(e) =>
              updateSimple(keyName, item.id, { subtitle: e.target.value })
            }
            placeholder={subtitleLabel}
          />
        </Field>
      </div>
      <Field label="Date">
        <Input
          className="h-9 text-sm"
          value={item.date}
          onChange={(e) =>
            updateSimple(keyName, item.id, { date: e.target.value })
          }
          placeholder="2024"
        />
      </Field>
      <Field label="Description">
        <Textarea
          rows={2}
          value={item.description}
          onChange={(e) =>
            updateSimple(keyName, item.id, { description: e.target.value })
          }
          className="min-h-[52px] resize-none text-sm"
          placeholder="Optional description."
        />
      </Field>
      <div className="flex justify-end pt-0.5">
        <IconButtonRow onDelete={() => removeSimple(keyName, item.id)} />
      </div>
    </div>
  );
}

function ReferenceEntryCard({
  reference,
}: {
  reference: ReferenceItem;
}) {
  const updateReference = useResumeStore((s) => s.updateReference);
  const removeReference = useResumeStore((s) => s.removeReference);

  return (
    <div className="space-y-2.5 rounded-lg border bg-background/60 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Name">
          <Input
            className="h-9 text-sm"
            value={reference.name}
            onChange={(e) =>
              updateReference(reference.id, { name: e.target.value })
            }
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Role">
          <Input
            className="h-9 text-sm"
            value={reference.role}
            onChange={(e) =>
              updateReference(reference.id, { role: e.target.value })
            }
            placeholder="Engineering Manager"
          />
        </Field>
        <Field label="Company">
          <Input
            className="h-9 text-sm"
            value={reference.company}
            onChange={(e) =>
              updateReference(reference.id, { company: e.target.value })
            }
            placeholder="Acme Inc."
          />
        </Field>
        <Field label="Contact">
          <Input
            className="h-9 text-sm"
            value={reference.contact}
            onChange={(e) =>
              updateReference(reference.id, { contact: e.target.value })
            }
            placeholder="email / phone"
          />
        </Field>
      </div>
      <div className="flex justify-end pt-0.5">
        <IconButtonRow onDelete={() => removeReference(reference.id)} />
      </div>
    </div>
  );
}

function CustomItemEntryCard({
  sectionId,
  item,
}: {
  sectionId: string;
  item: SimpleItem;
}) {
  const updateCustomItem = useResumeStore((s) => s.updateCustomItem);
  const removeCustomItem = useResumeStore((s) => s.removeCustomItem);

  return (
    <div className="space-y-2.5 rounded-lg border bg-background/60 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Title">
          <Input
            className="h-9 text-sm"
            value={item.title}
            onChange={(e) =>
              updateCustomItem(sectionId, item.id, { title: e.target.value })
            }
            placeholder="Title"
          />
        </Field>
        <Field label="Subtitle">
          <Input
            className="h-9 text-sm"
            value={item.subtitle}
            onChange={(e) =>
              updateCustomItem(sectionId, item.id, {
                subtitle: e.target.value,
              })
            }
            placeholder="Subtitle"
          />
        </Field>
      </div>
      <Field label="Date">
        <Input
          className="h-9 text-sm"
          value={item.date}
          onChange={(e) =>
            updateCustomItem(sectionId, item.id, { date: e.target.value })
          }
          placeholder="2024"
        />
      </Field>
      <Field label="Description">
        <Textarea
          rows={2}
          value={item.description}
          onChange={(e) =>
            updateCustomItem(sectionId, item.id, {
              description: e.target.value,
            })
          }
          className="min-h-[52px] resize-none text-sm"
          placeholder="Optional description."
        />
      </Field>
      <div className="flex justify-end pt-0.5">
        <IconButtonRow
          onDelete={() => removeCustomItem(sectionId, item.id)}
        />
      </div>
    </div>
  );
}

function CustomSectionEntryCard({ section }: { section: CustomSection }) {
  const updateCustomSection = useResumeStore((s) => s.updateCustomSection);
  const removeCustomSection = useResumeStore((s) => s.removeCustomSection);
  const addCustomItem = useResumeStore((s) => s.addCustomItem);
  const moveCustomItem = useResumeStore((s) => s.moveCustomItem);

  const handleDragEnd = makeDragEndHandler(section.items, (fromIdx, toIdx) =>
    moveCustomItem(section.id, fromIdx, toIdx)
  );

  return (
    <div className="space-y-2.5 rounded-lg border bg-background/60 p-3">
      <div className="flex items-center gap-2">
        <Field label="Section title" className="flex-1">
          <Input
            className="h-9 text-sm font-medium"
            value={section.title}
            onChange={(e) =>
              updateCustomSection(section.id, { title: e.target.value })
            }
            placeholder="Section title"
          />
        </Field>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-5 shrink-0 gap-1 text-destructive hover:bg-destructive/10"
          onClick={() => removeCustomSection(section.id)}
        >
          <Trash2 className="size-3.5" /> Delete section
        </Button>
      </div>

      <div className="space-y-2">
        {section.items.length === 0 && (
          <p className="rounded-md border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            No items yet — add your first entry.
          </p>
        )}
        {section.items.length > 0 && (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={section.items.map((it) => it.id)}
              strategy={verticalListSortingStrategy}
            >
              {section.items.map((item) => (
                <SortableEntry key={item.id} id={item.id}>
                  <CustomItemEntryCard sectionId={section.id} item={item} />
                </SortableEntry>
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <AddButton
        onClick={() => addCustomItem(section.id)}
        label="Add item"
      />
    </div>
  );
}

// ---------- Main ----------

export function ResumeEditor() {
  const data: ResumeData = useResumeStore((s) => s.data);
  const update = useResumeStore((s) => s.update);
  const updateSummary = useResumeStore((s) => s.updateSummary);
  const addExperience = useResumeStore((s) => s.addExperience);
  const addProject = useResumeStore((s) => s.addProject);
  const addEducation = useResumeStore((s) => s.addEducation);
  const addSimple = useResumeStore((s) => s.addSimple);
  const setSkills = useResumeStore((s) => s.setSkills);
  const setTagList = useResumeStore((s) => s.setTagList);
  const addReference = useResumeStore((s) => s.addReference);
  const addCustomSection = useResumeStore((s) => s.addCustomSection);
  const setPhoto = useResumeStore((s) => s.setPhoto);
  const setSkillLevel = useResumeStore((s) => s.setSkillLevel);
  const moveExperience = useResumeStore((s) => s.moveExperience);
  const moveProject = useResumeStore((s) => s.moveProject);
  const moveEducation = useResumeStore((s) => s.moveEducation);
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const [customDialogOpen, setCustomDialogOpen] = React.useState(false);
  const [customTitle, setCustomTitle] = React.useState("");

  const handleExperienceDragEnd = makeDragEndHandler(
    data.experience,
    moveExperience
  );
  const handleProjectDragEnd = makeDragEndHandler(data.projects, moveProject);
  const handleEducationDragEnd = makeDragEndHandler(
    data.education,
    moveEducation
  );

  const handleAddCustomSection = () => {
    const trimmed = customTitle.trim();
    if (!trimmed) {
      toast.error("Section title is required");
      return;
    }
    addCustomSection(trimmed);
    setCustomTitle("");
    setCustomDialogOpen(false);
    toast.success("Custom section added");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      {/* 1. Personal Info */}
      <SectionCard
        id="personal"
        icon={User}
        title="Personal Info"
        defaultOpen
      >
        {/* Photo upload */}
        <div className="mb-3 flex items-center gap-3">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          {data.photo ? (
            <img
              src={data.photo}
              alt="Profile"
              className="size-16 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <div className="grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
              <User className="size-6" />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => photoInputRef.current?.click()}
            >
              <Upload className="size-3" />
              {data.photo ? "Change photo" : "Upload photo"}
            </Button>
            {data.photo && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-destructive"
                onClick={() => setPhoto("")}
              >
                <Trash2 className="size-3" /> Remove
              </Button>
            )}
            <p className="text-[10px] text-muted-foreground">
              For photo templates (Engineer, UX, etc.)
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label="Full name">
            <Input
              className="h-9 text-sm"
              value={data.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Deepak Sharma"
            />
          </Field>
          <Field label="Title">
            <Input
              className="h-9 text-sm"
              value={data.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Senior Frontend Engineer"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              className="h-9 text-sm"
              value={data.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="you@email.com"
            />
          </Field>
          <Field label="Phone">
            <Input
              className="h-9 text-sm"
              value={data.phone}
              onChange={(e) => update({ phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </Field>
          <Field label="Location">
            <Input
              className="h-9 text-sm"
              value={data.location}
              onChange={(e) => update({ location: e.target.value })}
              placeholder="Bengaluru, India"
            />
          </Field>
          <Field label="LinkedIn">
            <Input
              className="h-9 text-sm"
              value={data.linkedin}
              onChange={(e) => update({ linkedin: e.target.value })}
              placeholder="linkedin.com/in/…"
            />
          </Field>
          <Field label="GitHub">
            <Input
              className="h-9 text-sm"
              value={data.github}
              onChange={(e) => update({ github: e.target.value })}
              placeholder="github.com/…"
            />
          </Field>
          <Field label="Website">
            <Input
              className="h-9 text-sm"
              value={data.website}
              onChange={(e) => update({ website: e.target.value })}
              placeholder="yourname.dev"
            />
          </Field>
        </div>
      </SectionCard>

      {/* 2. Summary */}
      <SectionCard id="summary" icon={FileText} title="Summary" defaultOpen>
        <Field label="Professional summary">
          <Textarea
            rows={4}
            value={data.summary}
            onChange={(e) => updateSummary(e.target.value)}
            className="resize-none text-sm"
            placeholder="A short pitch that captures your impact and skills."
          />
        </Field>
        <AIActionButtons
          text={data.summary}
          onResult={(r) => updateSummary(r)}
          onMultiResult={(lines) => updateSummary(lines.join("\n"))}
        />
      </SectionCard>

      {/* 3. Experience */}
      <SectionCard
        id="experience"
        icon={Briefcase}
        title="Experience"
        count={data.experience.length}
        defaultOpen
      >
        <div className="space-y-3">
          {data.experience.length > 0 && (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleExperienceDragEnd}
            >
              <SortableContext
                items={data.experience.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                {data.experience.map((exp) => (
                  <SortableEntry key={exp.id} id={exp.id}>
                    <ExperienceEntryCard exp={exp} />
                  </SortableEntry>
                ))}
              </SortableContext>
            </DndContext>
          )}
          {data.experience.length === 0 && (
            <p className="rounded-md border border-dashed bg-muted/30 px-3 py-3 text-center text-xs text-muted-foreground">
              No experience entries yet.
            </p>
          )}
          <AddButton onClick={addExperience} label="Add experience" />
        </div>
      </SectionCard>

      {/* 4. Skills */}
      <SectionCard
        id="skills"
        icon={Sparkles}
        title="Skills"
        count={data.skills.length}
      >
        <Field label="Skills">
          <TagInput
            values={data.skills}
            onChange={setSkills}
            placeholder="Add a skill (Enter or comma)"
          />
        </Field>
        {data.skills.length > 0 && (
          <div className="mt-3 space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Skill levels (for bar templates)
            </p>
            {data.skills.map((sk) => (
              <div key={sk} className="flex items-center gap-2">
                <span className="w-28 shrink-0 truncate text-xs">{sk}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={data.skillLevels[sk] ?? 80}
                  onChange={(e) =>
                    setSkillLevel(sk, parseInt(e.target.value))
                  }
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
                />
                <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {data.skillLevels[sk] ?? 80}%
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* 5. Projects */}
      <SectionCard
        id="projects"
        icon={FolderGit2}
        title="Projects"
        count={data.projects.length}
      >
        <div className="space-y-3">
          {data.projects.length > 0 && (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleProjectDragEnd}
            >
              <SortableContext
                items={data.projects.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {data.projects.map((p) => (
                  <SortableEntry key={p.id} id={p.id}>
                    <ProjectEntryCard project={p} />
                  </SortableEntry>
                ))}
              </SortableContext>
            </DndContext>
          )}
          {data.projects.length === 0 && (
            <p className="rounded-md border border-dashed bg-muted/30 px-3 py-3 text-center text-xs text-muted-foreground">
              No projects yet.
            </p>
          )}
          <AddButton onClick={addProject} label="Add project" />
        </div>
      </SectionCard>

      {/* 6. Education */}
      <SectionCard
        id="education"
        icon={GraduationCap}
        title="Education"
        count={data.education.length}
      >
        <div className="space-y-3">
          {data.education.length > 0 && (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleEducationDragEnd}
            >
              <SortableContext
                items={data.education.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                {data.education.map((ed) => (
                  <SortableEntry key={ed.id} id={ed.id}>
                    <EducationEntryCard edu={ed} />
                  </SortableEntry>
                ))}
              </SortableContext>
            </DndContext>
          )}
          {data.education.length === 0 && (
            <p className="rounded-md border border-dashed bg-muted/30 px-3 py-3 text-center text-xs text-muted-foreground">
              No education entries yet.
            </p>
          )}
          <AddButton onClick={addEducation} label="Add education" />
        </div>
      </SectionCard>

      {/* 7. Certifications */}
      <SectionCard
        id="certifications"
        icon={Award}
        title="Certifications"
        count={data.certifications.length}
      >
        <div className="space-y-3">
          {data.certifications.map((c) => (
            <SimpleEntryCard
              key={c.id}
              item={c}
              keyName="certifications"
              subtitleLabel="Issuer"
            />
          ))}
          {data.certifications.length === 0 && (
            <p className="rounded-md border border-dashed bg-muted/30 px-3 py-3 text-center text-xs text-muted-foreground">
              No certifications yet.
            </p>
          )}
          <AddButton
            onClick={() => addSimple("certifications")}
            label="Add certification"
          />
        </div>
      </SectionCard>

      {/* 8. Languages */}
      <SectionCard
        id="languages"
        icon={Globe}
        title="Languages"
        count={data.languages.length}
      >
        <Field label="Languages">
          <TagInput
            values={data.languages}
            onChange={(v) => setTagList("languages", v)}
            placeholder="English, Hindi…"
          />
        </Field>
      </SectionCard>

      {/* 9. Awards */}
      <SectionCard
        id="awards"
        icon={Trophy}
        title="Awards"
        count={data.awards.length}
      >
        <div className="space-y-3">
          {data.awards.map((a) => (
            <SimpleEntryCard
              key={a.id}
              item={a}
              keyName="awards"
              subtitleLabel="Organization"
            />
          ))}
          {data.awards.length === 0 && (
            <p className="rounded-md border border-dashed bg-muted/30 px-3 py-3 text-center text-xs text-muted-foreground">
              No awards yet.
            </p>
          )}
          <AddButton onClick={() => addSimple("awards")} label="Add award" />
        </div>
      </SectionCard>

      {/* 10. Publications */}
      <SectionCard
        id="publications"
        icon={BookOpen}
        title="Publications"
        count={data.publications.length}
      >
        <div className="space-y-3">
          {data.publications.map((p) => (
            <SimpleEntryCard
              key={p.id}
              item={p}
              keyName="publications"
              subtitleLabel="Publisher"
            />
          ))}
          {data.publications.length === 0 && (
            <p className="rounded-md border border-dashed bg-muted/30 px-3 py-3 text-center text-xs text-muted-foreground">
              No publications yet.
            </p>
          )}
          <AddButton
            onClick={() => addSimple("publications")}
            label="Add publication"
          />
        </div>
      </SectionCard>

      {/* 11. Interests */}
      <SectionCard
        id="interests"
        icon={Heart}
        title="Interests"
        count={data.interests.length}
      >
        <Field label="Interests">
          <TagInput
            values={data.interests}
            onChange={(v) => setTagList("interests", v)}
            placeholder="Open Source, Chess…"
          />
        </Field>
      </SectionCard>

      {/* 12. References */}
      <SectionCard
        id="references"
        icon={Users}
        title="References"
        count={data.references.length}
      >
        <div className="space-y-3">
          {data.references.map((r) => (
            <ReferenceEntryCard key={r.id} reference={r} />
          ))}
          {data.references.length === 0 && (
            <p className="rounded-md border border-dashed bg-muted/30 px-3 py-3 text-center text-xs text-muted-foreground">
              No references yet.
            </p>
          )}
          <AddButton onClick={addReference} label="Add reference" />
        </div>
      </SectionCard>

      {/* 13. Custom Sections */}
      <SectionCard
        id="custom"
        icon={Layers}
        title="Custom Sections"
        count={data.customSections.length}
      >
        <div className="space-y-3">
          {data.customSections.map((section) => (
            <CustomSectionEntryCard key={section.id} section={section} />
          ))}
          {data.customSections.length === 0 && (
            <p className="rounded-md border border-dashed bg-muted/30 px-3 py-3 text-center text-xs text-muted-foreground">
              No custom sections yet — add one for volunteering, hobbies,
              patents, or anything else.
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 border-dashed"
            onClick={() => setCustomDialogOpen(true)}
          >
            <Plus className="size-3.5" /> Add custom section
          </Button>
        </div>
      </SectionCard>

      <Dialog
        open={customDialogOpen}
        onOpenChange={(open) => {
          setCustomDialogOpen(open);
          if (!open) setCustomTitle("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New custom section</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Section title
            </Label>
            <Input
              autoFocus
              className="h-9 text-sm"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomSection();
                }
              }}
              placeholder="e.g. Volunteer Work, Patents, Conferences"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCustomDialogOpen(false);
                setCustomTitle("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-1"
              onClick={handleAddCustomSection}
            >
              <Plus className="size-3.5" /> Add section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
