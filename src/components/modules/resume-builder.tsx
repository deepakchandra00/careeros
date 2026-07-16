"use client";

import * as React from "react";
import {
  FileText,
  Download,
  Upload,
  ClipboardPaste,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileType2,
  Loader2,
  CheckCircle2,
  Palette,
  Type as TypeIcon,
  Check,
  ChevronDown,
  ArrowUpDown,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ModuleHeader, AIButton } from "@/components/shared/blocks";
import { useResumeStore, type SectionId } from "@/store/resume-store";
import { ResumeEditor } from "@/components/modules/resume-editor";
import {
  ResumePreview,
  TEMPLATE_OPTIONS,
  FONT_OPTIONS,
  ACCENT_OPTIONS,
} from "@/components/modules/resume-templates";
import { TEMPLATE_PRESETS, type TemplatePreset } from "@/lib/resume/template-presets";
import { PREMIUM_TEMPLATES, type PremiumTemplatePreset } from "@/lib/resume/premium-templates";
import { extractTextFromFile } from "@/lib/resume/extract";
import { exportResumeDocx } from "@/lib/resume/export-docx";
import { exportResumePdf } from "@/lib/resume/export-pdf";
import { splitResumeSections, compressSkills } from "@/lib/resume/splitter";
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

const ALL_SECTIONS: { id: SectionId; label: string }[] = [
  { id: "personal", label: "Personal Info" },
  { id: "summary", label: "Summary" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "certifications", label: "Certifications" },
  { id: "languages", label: "Languages" },
  { id: "awards", label: "Awards" },
  { id: "publications", label: "Publications" },
  { id: "interests", label: "Interests" },
  { id: "references", label: "References" },
];

const DEFAULT_SECTIONS: Record<string, boolean> = {
  personal: true,
  summary: true,
  experience: true,
  skills: true,
  projects: true,
  education: true,
  certifications: true,
  languages: true,
  awards: false,
  publications: false,
  interests: false,
  references: false,
};

// ---------- Section reordering dialog ----------

/**
 * Sections pinned to the top — never draggable, always rendered first in
 * this fixed order.
 */
const PINNED_SECTION_IDS = ["personal", "summary"];

function SortableSectionRow({
  id,
  label,
  visible,
  onToggle,
}: {
  id: string;
  label: string;
  visible: boolean;
  onToggle: () => void;
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
      className="flex items-center gap-2 rounded-lg border bg-card p-2.5"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Drag ${label} to reorder`}
        className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="flex-1 truncate text-sm font-medium">{label}</span>
      <Checkbox
        checked={visible}
        onCheckedChange={onToggle}
        aria-label={`Toggle visibility for ${label}`}
      />
    </div>
  );
}

function ReorderSectionsDialog({
  open,
  onOpenChange,
  sectionOrder,
  sections,
  onToggleSection,
  setSectionOrder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionOrder: string[];
  sections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  setSectionOrder: (order: string[]) => void;
}) {
  const labelFor = (id: string) =>
    ALL_SECTIONS.find((s) => s.id === id)?.label ?? id;

  // Split the order: pinned sections render first (always), the rest are
  // free to reorder. Any pinned ids missing from the persisted order get
  // prepended back so the store stays consistent.
  const pinnedPresent = PINNED_SECTION_IDS.filter((id) =>
    sectionOrder.includes(id)
  );
  const pinnedMissing = PINNED_SECTION_IDS.filter(
    (id) => !sectionOrder.includes(id)
  );
  const sortableIds = sectionOrder.filter(
    (id) => !PINNED_SECTION_IDS.includes(id)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const oldIndex = sortableIds.indexOf(activeId);
    const newIndex = sortableIds.indexOf(overId);
    if (oldIndex < 0 || newIndex < 0) return;
    const nextSortable = [...sortableIds];
    const [moved] = nextSortable.splice(oldIndex, 1);
    nextSortable.splice(newIndex, 0, moved);
    setSectionOrder([
      ...pinnedMissing,
      ...pinnedPresent,
      ...nextSortable,
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpDown className="size-5 text-primary" />
            Reorder sections
          </DialogTitle>
          <DialogDescription>
            Drag sections up or down to reorder them. Personal Info and Summary
            are pinned at the top. Toggle the checkbox to show or hide a
            section in the preview.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {pinnedPresent.map((id) => (
            <div
              key={id}
              className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2.5"
            >
              <span className="grid size-7 shrink-0 place-items-center text-muted-foreground/40">
                <GripVertical className="size-4 opacity-40" />
              </span>
              <span className="flex-1 truncate text-sm font-medium">
                {labelFor(id)}
              </span>
              <Checkbox
                checked={!!sections[id]}
                onCheckedChange={() => onToggleSection(id)}
                aria-label={`Toggle visibility for ${labelFor(id)}`}
              />
            </div>
          ))}

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={sortableIds}
              strategy={verticalListSortingStrategy}
            >
              {sortableIds.map((id) => (
                <SortableSectionRow
                  key={id}
                  id={id}
                  label={labelFor(id)}
                  visible={!!sections[id]}
                  onToggle={() => onToggleSection(id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ResumeBuilderModule() {
  const data = useResumeStore((s) => s.data);
  const style = useResumeStore((s) => s.style);
  const setStyle = useResumeStore((s) => s.setStyle);
  const hydrate = useResumeStore((s) => s.hydrate);
  const setData = useResumeStore((s) => s.setData);
  const reset = useResumeStore((s) => s.reset);
  const setSectionOrder = useResumeStore((s) => s.setSectionOrder);

  const [sections, setSections] = React.useState<Record<string, boolean>>(
    DEFAULT_SECTIONS
  );
  const [zoom, setZoom] = React.useState(0.75);
  const [importing, setImporting] = React.useState(false);
  const [exportingDocx, setExportingDocx] = React.useState(false);
  const [exportingPdf, setExportingPdf] = React.useState(false);
  const [pasteOpen, setPasteOpen] = React.useState(false);
  const [pasteText, setPasteText] = React.useState("");
  const [pasting, setPasting] = React.useState(false);
  const [reorderOpen, setReorderOpen] = React.useState(false);
  const [importSteps, setImportSteps] = React.useState<
    { label: string; status: "pending" | "parsing" | "done"; count?: number }[]
  >([]);
  const [templatePickerOpen, setTemplatePickerOpen] = React.useState(false);
  const [templateSearch, setTemplateSearch] = React.useState("");
  const [templateCategory, setTemplateCategory] = React.useState("All");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const toggleSection = React.useCallback((id: string) => {
    setSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Hydrate from localStorage on mount
  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  // ---- Import flow (live-streaming chunked) ----
  /**
   * Split the resume text into sections, then parse each section sequentially
   * via /api/ai/parse-resume-chunked. After each section completes, update the
   * resume store immediately so the preview updates in real-time.
   */
  const parseAndPopulate = async (text: string): Promise<void> => {
    const splitSections = splitResumeSections(text);

    // Initialize progress steps
    const steps: { label: string; status: "pending" | "parsing" | "done"; count?: number }[] = [
      { label: "Contact & Name", status: "pending" },
      { label: "Summary", status: "pending" },
      { label: "Skills", status: "pending" },
      { label: "Experience", status: "pending" },
      { label: "Projects", status: "pending" },
      { label: "Education", status: "pending" },
    ];
    setImportSteps([...steps]);

    // Helper to update a step's status
    const updateStep = (idx: number, status: "parsing" | "done", count?: number) => {
      setImportSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, status, count } : s)));
    };

    // Helper: call the chunked API for one section (with retry on rate limit)
    const parseSection = async (
      section: "contact" | "summary" | "skills" | "experience" | "projects" | "education",
      sectionText: string
    ): Promise<Record<string, unknown>> => {
      if (!sectionText || sectionText.trim().length < 10) return {};
      const processedText =
        section === "skills" ? compressSkills(sectionText) : sectionText;
      if (!processedText || processedText.trim().length < 10) return {};

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch("/api/ai/parse-resume-chunked", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section, text: processedText }),
          });
          const raw = await res.text();
          let json: unknown;
          try {
            json = raw ? JSON.parse(raw) : null;
          } catch {
            if (attempt < 2) { await new Promise((r) => setTimeout(r, 2000 * (attempt + 1))); continue; }
            return {};
          }
          if (!res.ok) {
            if (attempt < 2) { await new Promise((r) => setTimeout(r, 2000 * (attempt + 1))); continue; }
            return {};
          }
          return (json as Record<string, unknown>) ?? {};
        } catch {
          if (attempt < 2) { await new Promise((r) => setTimeout(r, 2000 * (attempt + 1))); continue; }
          return {};
        }
      }
      return {};
    };

    // Helper: split large text into ~2000 char chunks at paragraph boundaries
    // (2000 = more reliable LLM parsing than 3000, fewer JSON parse failures)
    const chunkText = (text: string, maxLen = 2000): string[] => {
      if (text.length <= maxLen) return [text];
      const paragraphs = text.split(/\n\s*\n/);
      const chunks: string[] = [];
      let current = "";
      for (const p of paragraphs) {
        if ((current + "\n\n" + p).length > maxLen && current) {
          chunks.push(current);
          current = p;
        } else {
          current = current ? current + "\n\n" + p : p;
        }
      }
      if (current) chunks.push(current);
      return chunks;
    };

    const uid = () => Math.random().toString(36).slice(2, 10);
    // Working copy that we update incrementally
    let working = { ...data };

    // Step 0: Contact
    updateStep(0, "parsing");
    const contactRes = await parseSection("contact", splitSections.contact);
    working = {
      ...working,
      name: (contactRes.name as string) || working.name,
      title: (contactRes.title as string) || working.title,
      email: (contactRes.email as string) || working.email,
      phone: (contactRes.phone as string) || working.phone,
      location: (contactRes.location as string) || working.location,
      linkedin: (contactRes.linkedin as string) || working.linkedin,
      github: (contactRes.github as string) || working.github,
      website: (contactRes.website as string) || working.website,
    };
    setData(working);
    updateStep(0, "done");

    // Step 1: Summary
    updateStep(1, "parsing");
    const summaryRes = await parseSection("summary", splitSections.summary);
    working = { ...working, summary: (summaryRes.summary as string) || working.summary };
    setData(working);
    updateStep(1, "done");

    // Step 2: Skills
    updateStep(2, "parsing");
    const skillsRes = await parseSection("skills", splitSections.skills);
    const skills = (skillsRes.skills as string[]) || working.skills;
    working = { ...working, skills };
    setData(working);
    updateStep(2, "done", skills.length);

    // Step 3: Experience (may be chunked, with fallback retry on smaller chunks)
    updateStep(3, "parsing");
    const expChunks = chunkText(splitSections.experience);
    const allExp: typeof data.experience = [];
    for (const chunk of expChunks) {
      let r = await parseSection("experience", chunk);
      // Fallback: if this chunk returned nothing, retry with a smaller chunk size
      if (!r.experience || !Array.isArray(r.experience) || r.experience.length === 0) {
        const smallerChunks = chunkText(chunk, 1000);
        for (const sc of smallerChunks) {
          const sr = await parseSection("experience", sc);
          const sarr = sr.experience as typeof data.experience;
          if (Array.isArray(sarr)) {
            allExp.push(...sarr.map((e) => ({ ...e, id: uid() })));
            working = { ...working, experience: allExp };
            setData(working);
            updateStep(3, "parsing", allExp.length);
          }
        }
      } else {
        const arr = r.experience as typeof data.experience;
        allExp.push(...arr.map((e) => ({ ...e, id: uid() })));
        // Live update after each sub-chunk
        working = { ...working, experience: allExp };
        setData(working);
        updateStep(3, "parsing", allExp.length);
      }
    }
    if (allExp.length === 0) {
      toast.warning("Experience: 0 captured (parsing failed). Try Paste text to import manually.");
      allExp.push(...working.experience);
    }
    working = { ...working, experience: allExp };
    setData(working);
    updateStep(3, "done", allExp.length);

    // Step 4: Projects (may be chunked, with fallback retry on smaller chunks)
    updateStep(4, "parsing");
    const projChunks = chunkText(splitSections.projects);
    const allProj: typeof data.projects = [];
    for (const chunk of projChunks) {
      let r = await parseSection("projects", chunk);
      // Fallback: if this chunk returned nothing, retry with a smaller chunk size
      if (!r.projects || !Array.isArray(r.projects) || r.projects.length === 0) {
        const smallerChunks = chunkText(chunk, 1000);
        for (const sc of smallerChunks) {
          const sr = await parseSection("projects", sc);
          const sarr = sr.projects as typeof data.projects;
          if (Array.isArray(sarr)) {
            allProj.push(...sarr.map((p) => ({ ...p, id: uid() })));
            working = { ...working, projects: allProj };
            setData(working);
            updateStep(4, "parsing", allProj.length);
          }
        }
      } else {
        const arr = r.projects as typeof data.projects;
        allProj.push(...arr.map((p) => ({ ...p, id: uid() })));
        working = { ...working, projects: allProj };
        setData(working);
        updateStep(4, "parsing", allProj.length);
      }
    }
    if (allProj.length === 0) {
      toast.warning("Projects: 0 captured (parsing failed). Try Paste text to import manually.");
      allProj.push(...working.projects);
    }
    working = { ...working, projects: allProj };
    setData(working);
    updateStep(4, "done", allProj.length);

    // Step 5: Education
    updateStep(5, "parsing");
    const eduRes = await parseSection("education", splitSections.education);
    const education = ((eduRes.education as typeof data.education) ?? []).map((ed) => ({ ...ed, id: uid() }));
    const certifications = ((eduRes.certifications as typeof data.certifications) ?? []).map((c) => ({ ...c, id: uid() }));
    working = {
      ...working,
      education: education.length ? education : working.education,
      certifications: certifications.length ? certifications : working.certifications,
    };
    setData(working);
    updateStep(5, "done", education.length);

    // Enable sections that have content
    const next = { ...DEFAULT_SECTIONS };
    if (working.awards.length) next.awards = true;
    if (working.publications.length) next.publications = true;
    if (working.interests.length) next.interests = true;
    if (working.references.length) next.references = true;
    setSections(next);
    setImportSteps([]);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      toast.info(`Extracting text from ${file.name}…`);
      const text = await extractTextFromFile(file);
      if (!text || text.length < 30) {
        throw new Error("Couldn't read enough text from this file. Try pasting the text manually.");
      }
      toast.info("AI is parsing your resume — this can take 30–60s for large files…");
      await parseAndPopulate(text);
      toast.success("Resume imported and filled in!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed", {
        description: "Tip: click Import → Paste text to manually enter your resume.",
        duration: 8000,
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /** Paste-manual fallback: user pastes resume text directly, bypassing PDF extraction. */
  const handlePasteImport = async () => {
    if (!pasteText.trim() || pasteText.trim().length < 30) {
      toast.error("Please paste at least a few sentences of your resume.");
      return;
    }
    setPasting(true);
    try {
      toast.info("AI is parsing your pasted resume — this can take 30–60s…");
      await parseAndPopulate(pasteText);
      toast.success("Resume imported and filled in!");
      setPasteOpen(false);
      setPasteText("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setPasting(false);
    }
  };

  // ---- PDF export (real PDF via @react-pdf/renderer) ----
  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await exportResumePdf(data, style);
      toast.success("PDF downloaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF export failed");
    } finally {
      setExportingPdf(false);
    }
  };

  // ---- Word export ----
  const handleExportDocx = async () => {
    setExportingDocx(true);
    try {
      await exportResumeDocx(data, style);
      toast.success("Word document downloaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Word export failed");
    } finally {
      setExportingDocx(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset resume to the sample data? Your edits will be lost.")) {
      reset();
      setSections(DEFAULT_SECTIONS);
      toast.success("Reset to sample resume.");
    }
  };

  return (
    <div className="space-y-4">
      <ModuleHeader
        icon={FileText}
        title="Resume Builder"
        description="Real templates, AI editing, PDF & Word export, and resume import."
      >
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            {importing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            Import
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => setPasteOpen(true)}
            disabled={importing || pasting}
          >
            <ClipboardPaste className="size-3.5" />
            Paste text
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleExportPdf}
            disabled={exportingPdf}
          >
            {exportingPdf ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )} PDF
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleExportDocx}
            disabled={exportingDocx}
          >
            {exportingDocx ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <FileType2 className="size-3.5" />
            )}
            Word
          </Button>
        </div>
      </ModuleHeader>

      {/* Toolbar: template + font + accent + zoom + sections */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-3">
          {/* Template selector — opens searchable picker with 100+ templates */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Template</span>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setTemplatePickerOpen(true)}
            >
              <span className="size-3 rounded-sm" style={{ background: style.accent }} />
              {TEMPLATE_PRESETS.find(
                (p) => p.base === style.template && p.accent === style.accent && p.font === style.font
              )?.name ?? TEMPLATE_OPTIONS.find((t) => t.id === style.template)?.name ?? "Modern"}
              <span className="ml-1 rounded bg-primary/10 px-1 text-[10px] font-medium text-primary">
                {TEMPLATE_PRESETS.length}+
              </span>
              <ChevronDown className="size-3.5" />
            </Button>
          </div>

          <div className="h-5 w-px bg-border" />

          {/* Font selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <TypeIcon className="size-3.5" />
                {FONT_OPTIONS.find((f) => f.id === style.font)?.name ?? "Sans"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Font</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {FONT_OPTIONS.map((f) => (
                <DropdownMenuItem
                  key={f.id}
                  onClick={() => setStyle({ font: f.id })}
                  style={{ fontFamily: f.stack }}
                  className="gap-2"
                >
                  <span className="flex-1">{f.name}</span>
                  {style.font === f.id && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Accent picker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Palette className="size-3.5" />
                <span className="size-3 rounded-full" style={{ background: style.accent }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Accent color</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="grid grid-cols-4 gap-2 p-1">
                {ACCENT_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setStyle({ accent: c })}
                    className={cn(
                      "grid size-7 place-items-center rounded-full ring-offset-2 ring-offset-background transition",
                      style.accent === c && "ring-2 ring-ring"
                    )}
                    style={{ background: c }}
                  >
                    {style.accent === c && <Check className="size-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-5 w-px bg-border" />

          {/* Zoom */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))}
                >
                  <ZoomOut className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom out</TooltipContent>
            </Tooltip>
            <span className="w-10 text-center text-xs font-medium tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setZoom((z) => Math.min(1.2, +(z + 0.1).toFixed(2)))}
                >
                  <ZoomIn className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom in</TooltipContent>
            </Tooltip>
          </div>

          <div className="h-5 w-px bg-border" />

          {/* Sections toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <FileText className="size-3.5" />
                Sections
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>Visible sections</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_SECTIONS.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  onClick={() =>
                    setSections((prev) => ({ ...prev, [s.id]: !prev[s.id] }))
                  }
                  className="gap-2"
                >
                  <span
                    className={cn(
                      "grid size-4 place-items-center rounded border",
                      sections[s.id]
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {sections[s.id] && <Check className="size-3" />}
                  </span>
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Reorder sections dialog */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setReorderOpen(true)}
          >
            <ArrowUpDown className="size-3.5" />
            Reorder
          </Button>

          <div className="ml-auto">
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleReset}>
              <RotateCcw className="size-3.5" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Editor + Preview */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* Editor */}
        <div className="lg:max-h-[calc(100vh-15rem)] lg:overflow-y-auto lg:pr-1 scroll-thin">
          <ResumeEditor />
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto scroll-thin">
          <div className="flex justify-center rounded-xl bg-muted/40 p-4 sm:p-8">
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease",
              }}
            >
              <ResumePreview data={data} style={style} sections={sections} />
            </div>
          </div>
        </div>
      </div>

      {/* Live import progress overlay */}
      {importSteps.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-lg">
          <div className="mb-3 flex items-center gap-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            <p className="text-sm font-semibold">Importing your resume…</p>
          </div>
          {/* Progress bar */}
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${(importSteps.filter((s) => s.status === "done").length / importSteps.length) * 100}%`,
              }}
            />
          </div>
          {/* Step list */}
          <div className="space-y-1.5">
            {importSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {step.status === "done" ? (
                  <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                ) : step.status === "parsing" ? (
                  <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />
                ) : (
                  <div className="size-3.5 shrink-0 rounded-full border border-muted-foreground/30" />
                )}
                <span className={cn("flex-1", step.status === "done" ? "text-foreground" : step.status === "parsing" ? "text-foreground font-medium" : "text-muted-foreground")}>
                  {step.label}
                </span>
                {step.count != null && step.status === "done" && (
                  <span className="text-muted-foreground">{step.count} {step.label === "Skills" ? "skills" : step.label === "Experience" ? "jobs" : step.label === "Projects" ? "projects" : "entries"}</span>
                )}
                {step.status === "parsing" && step.count != null && (
                  <span className="text-muted-foreground">{step.count}…</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template picker dialog — 140+ templates with thumbnails + categories */}
      <Dialog open={templatePickerOpen} onOpenChange={setTemplatePickerOpen}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-hidden p-0">
          <DialogHeader className="border-b p-4">
            <DialogTitle>Choose a template</DialogTitle>
            <DialogDescription>
              {PREMIUM_TEMPLATES.length + TEMPLATE_PRESETS.length} templates — search or filter by category.
            </DialogDescription>
          </DialogHeader>

          {/* Search + category tabs */}
          <div className="border-b p-3 space-y-2">
            <Input
              placeholder="Search templates… (e.g. 'engineer', 'purple', 'serif')"
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              className="h-9"
            />
            <div className="flex flex-wrap gap-1.5">
              {["All", "Premium", "Pro", "Tech", "Luxury", "Designer", "Featured", "Modern", "ATS", "Executive", "Minimal", "Creative", "Engineer"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTemplateCategory(cat)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    templateCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat === "Premium" && "✨ "}
                  {cat === "Pro" && "🎨 "}
                  {cat === "Tech" && "⚡ "}
                  {cat === "Luxury" && "💎 "}
                  {cat === "Designer" && "🏆 "}
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Template grid with thumbnails */}
          <div className="scroll-thin max-h-[58vh] overflow-y-auto p-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {/* Premium / Pro / Tech / Luxury templates with real image thumbnails */}
              {PREMIUM_TEMPLATES
                .filter((p) => {
                  if (templateCategory === "All") return true;
                  if (["Premium", "Pro", "Tech", "Luxury", "Designer"].includes(templateCategory)) {
                    return p.category === templateCategory.toLowerCase();
                  }
                  return false; // standard categories handled below
                })
                .filter((p) => {
                  if (!templateSearch.trim()) return true;
                  const q = templateSearch.toLowerCase();
                  return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
                })
                .map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setStyle({ template: preset.base, accent: preset.accent, font: preset.font });
                      setTemplatePickerOpen(false);
                      setTemplateSearch("");
                    }}
                    className={cn(
                      "group relative overflow-hidden rounded-lg border text-left transition-all hover:border-primary/40 hover:shadow-md",
                      style.template === preset.base && style.accent === preset.accent && style.font === preset.font
                        && "border-primary ring-2 ring-primary"
                    )}
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-muted">
                      <img
                        src={preset.thumbnail}
                        alt={preset.name}
                        className="h-full w-full object-cover object-top transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-2">
                      <div className="flex items-center gap-1">
                        <p className="truncate text-xs font-medium">{preset.name}</p>
                      </div>
                      <p className="truncate text-[10px] text-muted-foreground">{preset.description}</p>
                    </div>
                    <span className={cn(
                      "absolute right-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold text-white shadow",
                      preset.category === "designer" ? "bg-emerald-600" :
                      preset.category === "luxury" ? "bg-rose-600" :
                      preset.category === "tech" ? "bg-violet-600" :
                      preset.category === "pro" ? "bg-sky-600" :
                      "bg-amber-500"
                    )}>
                      {preset.category === "luxury" ? "LUXURY" :
                       preset.category === "designer" ? "DESIGNER" :
                       preset.category === "tech" ? "TECH" :
                       preset.category === "pro" ? "PRO" :
                       "PREMIUM"}
                    </span>
                  </button>
                ))}

              {/* Standard templates with CSS mini-preview */}
              {(templateCategory === "All" || (templateCategory !== "Premium" && templateCategory !== "Pro" && templateCategory !== "Tech" && templateCategory !== "Luxury" && templateCategory !== "Designer" && templateCategory !== "Featured")) &&
                TEMPLATE_PRESETS
                  .filter((p) => {
                    if (templateCategory === "All" || templateCategory === "Featured") {
                      return templateCategory === "Featured" ? p.category === "Featured" : true;
                    }
                    return p.category === templateCategory;
                  })
                  .filter((p) => {
                    if (!templateSearch.trim()) return true;
                    const q = templateSearch.toLowerCase();
                    return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
                  })
                  .slice(0, templateCategory === "All" ? 60 : 120) // limit for performance
                  .map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setStyle({ template: preset.base, accent: preset.accent, font: preset.font });
                        setTemplatePickerOpen(false);
                        setTemplateSearch("");
                      }}
                      className={cn(
                        "group relative overflow-hidden rounded-lg border text-left transition-all hover:border-primary/40 hover:shadow-md",
                        style.template === preset.base && style.accent === preset.accent && style.font === preset.font
                          && "border-primary ring-2 ring-primary"
                      )}
                    >
                      {/* CSS mini-preview */}
                      <div className="aspect-[3/4] bg-white p-1.5">
                        <TemplateMiniPreview preset={preset} />
                      </div>
                      <div className="p-2">
                        <p className="truncate text-xs font-medium">{preset.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{preset.description}</p>
                      </div>
                    </button>
                  ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Paste-text fallback dialog */}
      <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardPaste className="size-5 text-primary" />
              Paste your resume text
            </DialogTitle>
            <DialogDescription>
              If the file import timed out or failed, paste your resume text
              here and the AI will parse it. Copy the text from your PDF/DOCX
              and paste it below.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste your full resume text here…"
            className="min-h-[300px] resize-none font-mono text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPasteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePasteImport}
              disabled={pasting || pasteText.trim().length < 30}
              className="gap-1.5"
            >
              {pasting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Parse with AI
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reorder-sections dialog */}
      <ReorderSectionsDialog
        open={reorderOpen}
        onOpenChange={setReorderOpen}
        sectionOrder={data.sectionOrder}
        sections={sections}
        onToggleSection={toggleSection}
        setSectionOrder={setSectionOrder}
      />

      {/* Template picker dialog — 140+ templates with thumbnails + categories */}
      <Dialog open={templatePickerOpen} onOpenChange={setTemplatePickerOpen}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-hidden p-0">
          <DialogHeader className="border-b p-4">
            <DialogTitle>Choose a template</DialogTitle>
            <DialogDescription>
              {PREMIUM_TEMPLATES.length + TEMPLATE_PRESETS.length} templates — search or filter by category.
            </DialogDescription>
          </DialogHeader>
          <div className="border-b p-3 space-y-2">
            <Input
              placeholder="Search templates… (e.g. 'engineer', 'purple', 'serif')"
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              className="h-9"
            />
            <div className="flex flex-wrap gap-1.5">
              {["All", "Premium", "Pro", "Tech", "Luxury", "Featured", "Modern", "ATS", "Executive", "Minimal", "Creative", "Engineer"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTemplateCategory(cat)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    templateCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat === "Premium" && "✨ "}
                  {cat === "Pro" && "🎨 "}
                  {cat === "Tech" && "⚡ "}
                  {cat === "Luxury" && "💎 "}
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="scroll-thin max-h-[58vh] overflow-y-auto p-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {PREMIUM_TEMPLATES
                .filter((p) => {
                  if (templateCategory === "All") return true;
                  if (["Premium", "Pro", "Tech", "Luxury", "Designer"].includes(templateCategory)) {
                    return p.category === templateCategory.toLowerCase();
                  }
                  return false;
                })
                .filter((p) => !templateSearch.trim() || p.name.toLowerCase().includes(templateSearch.toLowerCase()) || p.description.toLowerCase().includes(templateSearch.toLowerCase()))
                .map((preset) => (
                  <button key={preset.id} onClick={() => { setStyle({ template: preset.base, accent: preset.accent, font: preset.font }); setTemplatePickerOpen(false); setTemplateSearch(""); }} className={cn("group relative overflow-hidden rounded-lg border text-left transition-all hover:border-primary/40 hover:shadow-md", style.template === preset.base && style.accent === preset.accent && style.font === preset.font && "border-primary ring-2 ring-primary")}>
                    <div className="aspect-[3/4] overflow-hidden bg-muted"><img src={preset.thumbnail} alt={preset.name} className="h-full w-full object-cover object-top transition-transform group-hover:scale-105" /></div>
                    <div className="p-2"><p className="truncate text-xs font-medium">{preset.name}</p><p className="truncate text-[10px] text-muted-foreground">{preset.description}</p></div>
                    <span className={cn("absolute right-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold text-white shadow", preset.category === "designer" ? "bg-emerald-600" : preset.category === "luxury" ? "bg-rose-600" : preset.category === "tech" ? "bg-violet-600" : preset.category === "pro" ? "bg-sky-600" : "bg-amber-500")}>{preset.category === "designer" ? "DESIGNER" : preset.category === "luxury" ? "LUXURY" : preset.category === "tech" ? "TECH" : preset.category === "pro" ? "PRO" : "PREMIUM"}</span>
                  </button>
                ))}
              {(templateCategory === "All" || (templateCategory !== "Premium" && templateCategory !== "Pro" && templateCategory !== "Tech" && templateCategory !== "Luxury" && templateCategory !== "Designer" && templateCategory !== "Featured")) &&
                TEMPLATE_PRESETS.filter((p) => templateCategory === "All" ? true : templateCategory === "Featured" ? p.category === "Featured" : p.category === templateCategory).filter((p) => !templateSearch.trim() || p.name.toLowerCase().includes(templateSearch.toLowerCase()) || p.description.toLowerCase().includes(templateSearch.toLowerCase())).slice(0, 60).map((preset) => (
                  <button key={preset.id} onClick={() => { setStyle({ template: preset.base, accent: preset.accent, font: preset.font }); setTemplatePickerOpen(false); setTemplateSearch(""); }} className={cn("group relative overflow-hidden rounded-lg border text-left transition-all hover:border-primary/40 hover:shadow-md", style.template === preset.base && style.accent === preset.accent && style.font === preset.font && "border-primary ring-2 ring-primary")}>
                    <div className="aspect-[3/4] bg-white p-1.5"><TemplateMiniPreview preset={preset} /></div>
                    <div className="p-2"><p className="truncate text-xs font-medium">{preset.name}</p><p className="truncate text-[10px] text-muted-foreground">{preset.description}</p></div>
                  </button>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Paste-text fallback dialog */}
      <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardPaste className="size-5 text-primary" />
              Paste your resume text
            </DialogTitle>
            <DialogDescription>
              If the file import timed out or failed, paste your resume text here and the AI will parse it.
            </DialogDescription>
          </DialogHeader>
          <Textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="Paste your full resume text here…" className="min-h-[300px] resize-none font-mono text-xs" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPasteOpen(false)}>Cancel</Button>
            <Button onClick={handlePasteImport} disabled={pasting || pasteText.trim().length < 30} className="gap-1.5">{pasting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}Parse with AI</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TemplateMiniPreview({ preset }: { preset: TemplatePreset }) {
  const accent = preset.accent;
  const isSidebar = ["modern", "software-engineer", "academic", "creative", "web-developer", "ux-designer", "teacher", "product-manager", "business-analyst"].includes(preset.base);
  if (isSidebar) {
    return (
      <div className="flex h-full gap-px" style={{ fontFamily: preset.font === "serif" ? "Georgia" : preset.font === "mono" ? "monospace" : "sans-serif" }}>
        <div className="w-1/3 p-1" style={{ background: accent }}>
          <div className="mb-1 size-3 rounded-full bg-white/30" />
          <div className="mb-0.5 h-0.5 w-3/4 rounded bg-white/40" />
          <div className="mb-0.5 h-0.5 w-1/2 rounded bg-white/30" />
          <div className="mb-1 h-1 w-full rounded bg-white/20" />
          <div className="space-y-0.5"><div className="h-0.5 w-full rounded bg-white/30" /><div className="h-0.5 w-2/3 rounded bg-white/25" /><div className="h-0.5 w-3/4 rounded bg-white/25" /></div>
        </div>
        <div className="flex-1 p-1">
          <div className="mb-0.5 h-1 w-2/3 rounded" style={{ background: accent }} />
          <div className="mb-1 h-0.5 w-1/2 rounded bg-gray-300" />
          <div className="mb-1 h-1 w-full rounded bg-gray-100" />
          <div className="space-y-0.5"><div className="h-0.5 w-full rounded bg-gray-200" /><div className="h-0.5 w-5/6 rounded bg-gray-200" /><div className="h-0.5 w-3/4 rounded bg-gray-200" /></div>
          <div className="mt-1 mb-0.5 h-0.5 w-1/3 rounded" style={{ background: accent }} />
          <div className="space-y-0.5"><div className="h-0.5 w-full rounded bg-gray-200" /><div className="h-0.5 w-2/3 rounded bg-gray-200" /></div>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full p-1" style={{ fontFamily: preset.font === "serif" ? "Georgia" : preset.font === "mono" ? "monospace" : "sans-serif" }}>
      <div className="mb-1 flex flex-col items-center"><div className="h-1 w-1/2 rounded" style={{ background: accent }} /><div className="mt-0.5 h-0.5 w-1/3 rounded bg-gray-300" /></div>
      <div className="mb-1 h-px w-full" style={{ background: accent }} />
      <div className="mb-1 h-0.5 w-1/4 rounded" style={{ background: accent }} />
      <div className="space-y-0.5"><div className="h-0.5 w-full rounded bg-gray-200" /><div className="h-0.5 w-5/6 rounded bg-gray-200" /><div className="h-0.5 w-3/4 rounded bg-gray-200" /></div>
      <div className="mt-1 mb-0.5 h-0.5 w-1/4 rounded" style={{ background: accent }} />
      <div className="space-y-0.5"><div className="h-0.5 w-full rounded bg-gray-200" /><div className="h-0.5 w-2/3 rounded bg-gray-200" /></div>
    </div>
  );
}
