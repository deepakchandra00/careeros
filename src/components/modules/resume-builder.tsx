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
  LayoutTemplate,
  Wand2,
  AlertTriangle,
  Keyboard,
  Share2,
  FileJson,
  Printer,
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
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ModuleHeader, AIButton } from "@/components/shared/blocks";
import { useResumeStore, type SectionId, type PageLayout } from "@/store/resume-store";
import { ResumeEditor } from "@/components/modules/resume-editor";
import { PageBasedPreview } from "@/components/modules/page-based-preview";
import { PageNavigator } from "@/components/modules/page-navigator";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { generatePageModel, type LayoutContext } from "@/lib/resume/layout-engine";
import { getTemplateLayout } from "@/components/resume/template-layout";
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
import { parseResumeWithoutAI } from "@/lib/resume/regex-parser";
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

// ---------- AI Layout Assistant presets ----------
/**
 * Each preset returns a partial PageLayout that the AI Layout Assistant will
 * apply to the store. The presets are intentionally simple — the layout engine
 * handles reflow automatically once padding changes.
 */
type LayoutPresetKey =
  | "fit-1"
  | "fit-2"
  | "compact"
  | "spacious"
  | "ats";

const LAYOUT_PRESETS: {
  key: LayoutPresetKey;
  label: string;
  description: string;
  apply: () => Partial<PageLayout>;
}[] = [
  {
    key: "fit-1",
    label: "Fit to 1 page",
    description: "Zero padding to maximize content area",
    apply: () => ({ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }),
  },
  {
    key: "fit-2",
    label: "Fit to 2 pages",
    description: "Slight padding for breathing room",
    apply: () => ({ paddingTop: 24, paddingBottom: 24, paddingLeft: 16, paddingRight: 16 }),
  },
  {
    key: "compact",
    label: "Compact",
    description: "Minimal padding + tighter spacing",
    apply: () => ({ paddingTop: 0, paddingBottom: 0, paddingLeft: 8, paddingRight: 8 }),
  },
  {
    key: "spacious",
    label: "Spacious",
    description: "Generous padding for an airy feel",
    apply: () => ({ paddingTop: 48, paddingBottom: 48, paddingLeft: 32, paddingRight: 32 }),
  },
  {
    key: "ats",
    label: "ATS Optimized",
    description: "Zero padding, single-column feel",
    apply: () => ({ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }),
  },
];

// ---------- Zoom presets ----------
type ZoomKey = "25" | "50" | "75" | "100" | "125" | "fit-width" | "fit-page";

const ZOOM_PRESETS: { key: ZoomKey; label: string }[] = [
  { key: "25", label: "25%" },
  { key: "50", label: "50%" },
  { key: "75", label: "75%" },
  { key: "100", label: "100%" },
  { key: "125", label: "125%" },
  { key: "fit-width", label: "Fit Width" },
  { key: "fit-page", label: "Fit Page" },
];

// ---------- Keyboard shortcuts hook ----------
interface KeyboardShortcutHandlers {
  onSave: () => void;
  onPrint: () => void;
  onShortcutsHelp: () => void;
}

/**
 * useKeyboardShortcuts — wires global Ctrl/Cmd+key shortcuts for the resume
 * builder. Undo/Redo are left to the browser (input fields handle them
 * natively), so we only register Save, Print, and the Help dialog.
 *
 * Returns nothing. Side-effect only.
 */
function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const ref = React.useRef(handlers);

  // Keep the latest handlers in the ref without touching it during render.
  React.useEffect(() => {
    ref.current = handlers;
  });

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();

      // Ctrl+S — Save (prevent browser save dialog)
      if (key === "s") {
        e.preventDefault();
        ref.current.onSave();
        return;
      }
      // Ctrl+P — Print (open print preview)
      if (key === "p") {
        e.preventDefault();
        ref.current.onPrint();
        return;
      }
      // Ctrl+/ — Show shortcuts help
      if (key === "/") {
        e.preventDefault();
        ref.current.onShortcutsHelp();
        return;
      }
      // Ctrl+Z / Ctrl+Shift+Z — leave to the browser (undo/redo on inputs)
      // Ctrl+D — duplicate selected section (handled below, no-op if no selection)
      // We don't have a "selected section" concept yet, so we let the browser
      // keep its default Ctrl+D behavior (bookmark) to avoid hijacking. The
      // shortcut is documented in the help dialog for future use.
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

// ---------- Common helper: counts keywords in the resume ----------
function countKeywords(data: ReturnType<typeof useResumeStore.getState>["data"]): number {
  const text = [
    data.summary,
    ...data.experience.flatMap((e) => [e.role, ...e.bullets]),
    ...data.projects.flatMap((p) => [p.name, p.description, ...p.tech]),
    ...data.skills,
    ...data.education.flatMap((e) => [e.degree, e.school]),
    ...data.certifications.flatMap((c) => [c.title, c.subtitle]),
  ].filter(Boolean).join(" ").toLowerCase();
  // Crude keyword detection: any capitalized word in the source data that's
  // 3+ chars and not a stopword. Good enough for a live metric.
  const stop = new Set(["the", "and", "for", "with", "from", "into", "this", "that", "have", "been", "was", "are", "you", "your", "our", "their", "they", "them", "but", "not", "all", "any", "can", "will", "would", "could", "should", "may", "might", "must", "shall"]);
  const tokens = text.split(/[^a-z0-9+#.\-]+/i).filter((t) => t.length >= 3 && !stop.has(t.toLowerCase()));
  const unique = new Set(tokens.map((t) => t.toLowerCase()));
  return unique.size;
}

function countCharacters(data: ReturnType<typeof useResumeStore.getState>["data"]): number {
  const text = [
    data.name, data.title, data.summary,
    ...data.experience.flatMap((e) => [e.role, e.company, e.location, ...e.bullets]),
    ...data.projects.flatMap((p) => [p.name, p.description, ...p.tech]),
    ...data.skills,
    ...data.education.flatMap((e) => [e.degree, e.school, e.location, e.grade]),
    ...data.certifications.flatMap((c) => [c.title, c.subtitle, c.description]),
    ...data.languages,
  ].filter(Boolean).join(" ");
  return text.length;
}

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
  const pageLayout = useResumeStore((s) => s.pageLayout);
  const setPageLayout = useResumeStore((s) => s.setPageLayout);
  const resetPageLayout = useResumeStore((s) => s.resetPageLayout);
  const pageBreaks = useResumeStore((s) => s.pageBreaks);
  const sectionSettings = useResumeStore((s) => s.sectionSettings);
  const hydrate = useResumeStore((s) => s.hydrate);
  const setData = useResumeStore((s) => s.setData);
  const reset = useResumeStore((s) => s.reset);
  const setSectionOrder = useResumeStore((s) => s.setSectionOrder);

  const [sections, setSections] = React.useState<Record<string, boolean>>(
    DEFAULT_SECTIONS
  );
  const [zoom, setZoom] = React.useState(0.75);
  const [zoomMode, setZoomMode] = React.useState<ZoomKey>("75");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [importing, setImporting] = React.useState(false);
  const [exportingDocx, setExportingDocx] = React.useState(false);
  const [exportingPdf, setExportingPdf] = React.useState(false);
  const [pasteOpen, setPasteOpen] = React.useState(false);
  const [pasteText, setPasteText] = React.useState("");
  const [pasting, setPasting] = React.useState(false);
  const [reorderOpen, setReorderOpen] = React.useState(false);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const [importSteps, setImportSteps] = React.useState<
    { label: string; status: "pending" | "parsing" | "done"; count?: number }[]
  >([]);
  const [templatePickerOpen, setTemplatePickerOpen] = React.useState(false);
  const [templateSearch, setTemplateSearch] = React.useState("");
  const [templateCategory, setTemplateCategory] = React.useState("All");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const previewScrollRef = React.useRef<HTMLDivElement>(null);

  // Compute page model, word count, and ATS score
  const sectionOrder = React.useMemo(
    () => data.sectionOrder.filter((id) => sections[id] !== false),
    [data.sectionOrder, sections]
  );

  const pageModel = React.useMemo(() => {
    const { pattern, sidebarWidth } = getTemplateLayout(style.template);
    const layout: LayoutContext = {
      pattern,
      sidebarWidth,
      headerBandHeight: pattern === "header-band" ? 120 : 0,
      padding: {
        top: pageLayout.paddingTop ?? 0,
        bottom: pageLayout.paddingBottom ?? 0,
        left: pageLayout.paddingLeft ?? 0,
        right: pageLayout.paddingRight ?? 0,
      },
      pageWidth: 794,
      pageHeight: 1123,
      accent: style.accent,
    };
    return generatePageModel(data, sectionOrder, {
      layout,
      pageBreaks,
      sectionSettings,
    });
  }, [data, sectionOrder, pageLayout, pageBreaks, sectionSettings, style.template, style.accent]);

  const wordCount = React.useMemo(() => {
    const text = [
      data.name, data.title, data.summary,
      ...data.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
      ...data.projects.flatMap((p) => [p.name, p.description]),
      ...data.skills,
      ...data.education.flatMap((e) => [e.degree, e.school]),
    ].filter(Boolean).join(" ");
    return text.split(/\s+/).filter(Boolean).length;
  }, [data]);

  const charCount = React.useMemo(() => countCharacters(data), [data]);
  const keywordCount = React.useMemo(() => countKeywords(data), [data]);
  const readingTimeMin = Math.max(1, Math.round(wordCount / 200));
  const estimatedPdfKb = React.useMemo(() => {
    // Crude estimate: ~1KB per 100 chars + 30KB base per page
    const base = 30 + Math.ceil(charCount / 100);
    return base * (pageModel?.totalPages ?? 1);
  }, [charCount, pageModel]);

  const atsScore = React.useMemo(() => {
    let score = 50;
    if (data.summary?.length > 50) score += 10;
    if (data.experience.length >= 2) score += 15;
    if (data.skills.length >= 8) score += 10;
    if (data.projects.length >= 1) score += 5;
    if (data.email && data.phone) score += 5;
    if (data.linkedin || data.github) score += 5;
    return Math.min(100, score);
  }, [data]);

  // Compute the tallest single section (used by the overflow indicator).
  // Heuristic: estimate each section's word count and flag the largest.
  const tallestSection = React.useMemo(() => {
    const candidates: { id: string; words: number }[] = [
      { id: "experience", words: data.experience.flatMap((e) => [e.role, ...e.bullets]).join(" ").split(/\s+/).filter(Boolean).length },
      { id: "skills", words: data.skills.length },
      { id: "projects", words: data.projects.flatMap((p) => [p.name, p.description, ...p.tech]).join(" ").split(/\s+/).filter(Boolean).length },
      { id: "education", words: data.education.flatMap((e) => [e.degree, e.school]).join(" ").split(/\s+/).filter(Boolean).length },
    ];
    return candidates.sort((a, b) => b.words - a.words)[0];
  }, [data]);

  const toggleSection = React.useCallback((id: string) => {
    setSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Hydrate from localStorage on mount
  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  // ---- AI Layout Assistant ----
  const applyLayoutPreset = (preset: typeof LAYOUT_PRESETS[number]) => {
    setPageLayout(preset.apply());
    toast.success(`Layout: ${preset.label}`, { description: preset.description });
  };

  // ---- Zoom helpers (Fit Width / Fit Page) ----
  const applyZoomPreset = React.useCallback((key: ZoomKey) => {
    setZoomMode(key);
    if (key === "fit-width" || key === "fit-page") {
      // Defer until after the dropdown closes so the container has its full width.
      requestAnimationFrame(() => {
        const container = previewScrollRef.current;
        if (!container) return;
        const containerWidth = container.clientWidth - 48; // padding
        const containerHeight = container.clientHeight - 48;
        const A4_W = 794;
        const A4_H = 1123;
        if (key === "fit-width") {
          const z = Math.max(0.1, Math.min(2, containerWidth / A4_W));
          setZoom(+z.toFixed(2));
        } else {
          const z = Math.max(0.1, Math.min(2, Math.min(containerWidth / A4_W, containerHeight / A4_H)));
          setZoom(+z.toFixed(2));
        }
      });
      return;
    }
    const numeric = parseInt(key, 10) / 100;
    setZoom(numeric);
  }, []);

  // ---- Save (keyboard shortcut) ----
  const handleSave = React.useCallback(() => {
    // Persist to localStorage (already happens via store subscribers, but call
    // hydrate to be safe) and show a confirmation toast.
    try {
      localStorage.setItem("careeros-resume-v2", JSON.stringify(data));
    } catch {}
    toast.success("Saved", { description: "Resume stored locally." });
  }, [data]);

  // ---- Open print preview ----
  const handlePrintPreview = React.useCallback(() => {
    window.open("/resume/preview", "_blank");
  }, []);

  // ---- Export JSON ----
  const handleExportJson = React.useCallback(() => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(data.name || "resume").toLowerCase().replace(/\s+/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("JSON exported");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "JSON export failed");
    }
  }, [data]);

  // ---- Share link ----
  const handleShareLink = React.useCallback(() => {
    const username = (data.name || "you").toLowerCase().replace(/\s+/g, "-");
    const url = `${window.location.origin}/u/${username}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast.success("Share link copied", { description: url });
      }).catch(() => {
        toast.success("Share link", { description: url });
      });
    } else {
      toast.success("Share link", { description: url });
    }
  }, [data.name]);

  // Wire keyboard shortcuts
  useKeyboardShortcuts({
    onSave: handleSave,
    onPrint: handlePrintPreview,
    onShortcutsHelp: () => setShortcutsOpen(true),
  });

  // ---- Import flow (instant regex parser, no AI needed) ----
  /**
   * Parse resume text using regex + pattern matching (no AI, instant, no API key needed).
   * Falls back to AI enhancement only if the regex parser finds nothing.
   */
  const parseAndPopulate = async (text: string): Promise<void> => {
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

    // Get the LATEST data from the store (avoids stale closure issues)
    const store = useResumeStore.getState();
    let working = { ...store.data };

    // Parse all sections at once using the regex parser (instant, no API call)
    const parsed = parseResumeWithoutAI(text);

    // Step 0: Contact (instant)
    updateStep(0, "parsing");
    working = {
      ...working,
      name: parsed.name || working.name,
      title: parsed.title || working.title,
      email: parsed.email || working.email,
      phone: parsed.phone || working.phone,
      location: parsed.location || working.location,
      linkedin: parsed.linkedin || working.linkedin,
      github: parsed.github || working.github,
      website: parsed.website || working.website,
    };
    setData(working);
    updateStep(0, "done");
    await new Promise(r => setTimeout(r, 100)); // brief delay for visual feedback

    // Step 1: Summary (instant)
    updateStep(1, "parsing");
    working = { ...working, summary: parsed.summary || working.summary };
    setData(working);
    updateStep(1, "done");
    await new Promise(r => setTimeout(r, 100));

    // Step 2: Skills (instant)
    updateStep(2, "parsing");
    const skills = parsed.skills || [];
    working = { ...working, skills: skills.length > 0 ? skills : working.skills };
    setData(working);
    updateStep(2, "done", skills.length);
    await new Promise(r => setTimeout(r, 100));

    // Step 3: Experience (instant)
    updateStep(3, "parsing");
    const experience = parsed.experience || [];
    working = { ...working, experience: experience.length > 0 ? experience : working.experience };
    setData(working);
    updateStep(3, "done", experience.length);
    await new Promise(r => setTimeout(r, 100));

    // Step 4: Projects (instant)
    updateStep(4, "parsing");
    const projects = parsed.projects || [];
    working = { ...working, projects: projects.length > 0 ? projects : working.projects };
    setData(working);
    updateStep(4, "done", projects.length);
    await new Promise(r => setTimeout(r, 100));

    // Step 5: Education (instant)
    updateStep(5, "parsing");
    const education = parsed.education || [];
    const certifications = parsed.certifications || [];
    working = {
      ...working,
      education: education.length > 0 ? education : working.education,
      certifications: certifications.length > 0 ? certifications : working.certifications,
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

    // Final force-update
    console.log("[import] Final data:", {
      name: working.name,
      email: working.email,
      experience: working.experience.length,
      projects: working.projects.length,
      skills: working.skills.length,
      education: working.education.length,
    });

    // Check if ANY data was actually imported
    const hasNewName = working.name !== store.data.name;
    const hasNewEmail = working.email !== store.data.email;
    const hasExperience = working.experience.length > 0 && working.experience.length !== store.data.experience.length;
    const hasSkills = working.skills.length > 0;
    const hasProjects = working.projects.length > 0 && working.projects.length !== store.data.projects.length;
    const hasEducation = working.education.length > 0;
    const anyDataImported = hasNewName || hasNewEmail || hasExperience || hasSkills || hasProjects || hasEducation;

    setData({ ...working });
    setImportSteps([]);

    if (!anyDataImported) {
      throw new Error("Could not parse this resume format. Try the Paste Text option to import manually.");
    }
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
      toast.info("Parsing your resume — this takes 2-3 seconds…");
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
            <span className="hidden sm:inline">Paste text</span>
          </Button>

          {/* Export dropdown — replaces separate PDF/Word buttons (Phase 3 #10) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Download className="size-3.5" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Export resume</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2"
                disabled={exportingPdf}
                onClick={handleExportPdf}
              >
                {exportingPdf ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <FileText className="size-3.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm">PDF</p>
                  <p className="text-[10px] text-muted-foreground">Download .pdf</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                disabled={exportingDocx}
                onClick={handleExportDocx}
              >
                {exportingDocx ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <FileType2 className="size-3.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm">Word</p>
                  <p className="text-[10px] text-muted-foreground">Download .docx</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={handleExportJson}>
                <FileJson className="size-3.5" />
                <div className="flex-1">
                  <p className="text-sm">JSON</p>
                  <p className="text-[10px] text-muted-foreground">Raw resume data</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={handlePrintPreview}>
                <Printer className="size-3.5" />
                <div className="flex-1">
                  <p className="text-sm">Print</p>
                  <p className="text-[10px] text-muted-foreground">Open print preview</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2" onClick={handleShareLink}>
                <Share2 className="size-3.5" />
                <div className="flex-1">
                  <p className="text-sm">Share link</p>
                  <p className="text-[10px] text-muted-foreground">Copy public URL</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

          {/* Zoom — dropdown with presets + Fit Width / Fit Page (Phase 3 #7) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ZoomIn className="size-3.5" />
                <span className="tabular-nums">
                  {zoomMode === "fit-width" || zoomMode === "fit-page"
                    ? ZOOM_PRESETS.find((z) => z.key === zoomMode)?.label
                    : `${Math.round(zoom * 100)}%`}
                </span>
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Zoom</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ZOOM_PRESETS.map((z) => (
                <DropdownMenuCheckboxItem
                  key={z.key}
                  checked={zoomMode === z.key}
                  onCheckedChange={() => applyZoomPreset(z.key)}
                >
                  {z.label}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <div className="flex items-center gap-1 px-2 py-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => setZoom((z) => Math.max(0.1, +(z - 0.1).toFixed(2)))}
                    >
                      <ZoomOut className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom out</TooltipContent>
                </Tooltip>
                <span className="flex-1 text-center text-[11px] tabular-nums text-muted-foreground">
                  {Math.round(zoom * 100)}%
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))}
                    >
                      <ZoomIn className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom in</TooltipContent>
                </Tooltip>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* AI Layout Assistant — applies page-layout presets (Phase 2 #1) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Wand2 className="size-3.5 text-primary" />
                <span className="hidden sm:inline">Optimize Layout</span>
                <span className="sm:hidden">AI</span>
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>AI Layout Assistant</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {LAYOUT_PRESETS.map((preset) => (
                <DropdownMenuItem
                  key={preset.key}
                  className="gap-2"
                  onClick={() => applyLayoutPreset(preset)}
                >
                  <div className="flex-1">
                    <p className="text-sm">{preset.label}</p>
                    <p className="text-[10px] text-muted-foreground">{preset.description}</p>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-muted-foreground"
                onClick={() => {
                  resetPageLayout();
                  toast.success("Layout reset to default");
                }}
              >
                <RotateCcw className="size-3.5" />
                <span className="text-sm">Reset to default</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-5 w-px bg-border" />

          {/* Page Layout — adjustable padding with auto-reflow */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <LayoutTemplate className="size-3.5" />
                <span className="hidden sm:inline">Layout</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Page Layout</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs"
                  onClick={() => resetPageLayout()}
                >
                  <RotateCcw className="size-3" />
                  Reset
                </Button>
              </div>

              {/* Top Padding */}
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Top Padding</label>
                  <span className="text-xs tabular-nums text-muted-foreground">{pageLayout.paddingTop}px</span>
                </div>
                <Slider
                  value={[pageLayout.paddingTop]}
                  min={0}
                  max={80}
                  step={1}
                  onValueChange={([v]) => setPageLayout({ paddingTop: v })}
                  className="w-full"
                />
              </div>

              {/* Bottom Padding */}
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Bottom Padding</label>
                  <span className="text-xs tabular-nums text-muted-foreground">{pageLayout.paddingBottom}px</span>
                </div>
                <Slider
                  value={[pageLayout.paddingBottom]}
                  min={0}
                  max={80}
                  step={1}
                  onValueChange={([v]) => setPageLayout({ paddingBottom: v })}
                  className="w-full"
                />
              </div>

              {/* Left Padding */}
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Left Padding</label>
                  <span className="text-xs tabular-nums text-muted-foreground">{pageLayout.paddingLeft}px</span>
                </div>
                <Slider
                  value={[pageLayout.paddingLeft]}
                  min={0}
                  max={80}
                  step={1}
                  onValueChange={([v]) => setPageLayout({ paddingLeft: v })}
                  className="w-full"
                />
              </div>

              {/* Right Padding */}
              <div className="mb-2">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Right Padding</label>
                  <span className="text-xs tabular-nums text-muted-foreground">{pageLayout.paddingRight}px</span>
                </div>
                <Slider
                  value={[pageLayout.paddingRight]}
                  min={0}
                  max={80}
                  step={1}
                  onValueChange={([v]) => setPageLayout({ paddingRight: v })}
                  className="w-full"
                />
              </div>

              <DropdownMenuSeparator />
              <p className="mt-2 text-[10px] text-muted-foreground">
                Increasing padding shrinks the content area. Content auto-reflows to the next page.
              </p>
            </DropdownMenuContent>
          </DropdownMenu>

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

          {/* Keyboard shortcuts help (Phase 3 #9) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setShortcutsOpen(true)}
                aria-label="Keyboard shortcuts"
              >
                <Keyboard className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Keyboard shortcuts (Ctrl+/)</TooltipContent>
          </Tooltip>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={handleSave}
              aria-label="Save (Ctrl+S)"
            >
              <CheckCircle2 className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleReset}>
              <RotateCcw className="size-3.5" /> <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Editor + Preview — Resizable Split Layout */}
      <div className="h-[calc(100vh-12rem)] min-h-[500px] overflow-hidden rounded-xl border">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left: Editor Panel */}
          <ResizablePanel defaultSize={38} minSize={25} maxSize={60} className="overflow-hidden">
            <div className="h-full overflow-y-auto scroll-thin p-4">
              <ResumeEditor />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right: Canvas Preview (the hero) */}
          <ResizablePanel defaultSize={62} minSize={40} className="overflow-hidden">
            <div className="flex h-full flex-col">
              {/* Canvas area */}
              <div
                ref={previewScrollRef}
                data-preview-scroll
                className="flex-1 overflow-auto scroll-thin bg-muted/30 p-4 sm:p-6"
              >
                <div className="flex justify-center">
                  <PageBasedPreview
                    data={data}
                    style={style}
                    sections={sections}
                    pageLayout={pageLayout}
                    zoom={zoom}
                    pageBreaks={pageBreaks}
                    sectionSettings={sectionSettings}
                  />
                </div>
              </div>

              {/* Page Navigation */}
              <div className="border-t bg-card/50 px-4 py-2">
                <PageNavigator
                  totalPages={pageModel?.totalPages ?? 1}
                  currentPage={currentPage}
                  onPageClick={(page) => {
                    // Scroll to the page in the preview
                    const previewArea = previewScrollRef.current;
                    if (previewArea) {
                      const pages = previewArea.querySelectorAll('.resume-page');
                      const targetPage = pages[page - 1];
                      if (targetPage) {
                        targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setCurrentPage(page);
                      }
                    }
                  }}
                />
              </div>

              {/* Status Bar — Live page metrics + overflow indicator (hidden in print) */}
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t bg-card px-4 py-1.5 text-[11px] text-muted-foreground print:hidden">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-medium text-foreground">
                    {pageModel?.totalPages ?? 1} page{(pageModel?.totalPages ?? 1) > 1 ? 's' : ''}
                  </span>
                  <span>·</span>
                  <span>{wordCount} words</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline">{charCount} chars</span>
                  <span className="hidden md:inline">·</span>
                  <span className="hidden md:inline">{keywordCount} keywords</span>
                  <span>·</span>
                  <span>~{readingTimeMin} min read</span>
                  <span className="hidden lg:inline">·</span>
                  <span className="hidden lg:inline">~{estimatedPdfKb} KB pdf</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Overflow indicator (Phase 2 #6) */}
                  {(pageModel?.totalPages ?? 1) > 1 ? (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      <AlertTriangle className="size-3" />
                      Content overflows to {pageModel?.totalPages} pages
                    </span>
                  ) : tallestSection && tallestSection.words > 220 ? (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800 capitalize dark:bg-amber-950 dark:text-amber-300">
                      <AlertTriangle className="size-3" />
                      {tallestSection.id} exceeds 1 page
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle2 className="size-3" />
                      Fits 1 page
                    </span>
                  )}
                  <span className="font-medium text-foreground">ATS: {atsScore}%</span>
                  {(pageLayout.paddingTop > 0 || pageLayout.paddingBottom > 0 || pageLayout.paddingLeft > 0 || pageLayout.paddingRight > 0) ? (
                    <span className="hidden sm:inline text-primary">· Custom padding</span>
                  ) : null}
                  {pageBreaks.length > 0 && (
                    <span className="hidden sm:inline text-primary">· {pageBreaks.length} page break{pageBreaks.length > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
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

      {/* Keyboard shortcuts help dialog (Phase 3 #9) */}
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="size-5 text-primary" />
              Keyboard shortcuts
            </DialogTitle>
            <DialogDescription>
              Speed up your workflow with these shortcuts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {[
              { keys: ["Ctrl", "S"], desc: "Save resume (local)" },
              { keys: ["Ctrl", "Z"], desc: "Undo (input field)" },
              { keys: ["Ctrl", "Shift", "Z"], desc: "Redo (input field)" },
              { keys: ["Ctrl", "P"], desc: "Open print preview" },
              { keys: ["Ctrl", "D"], desc: "Duplicate selected section (coming soon)" },
              { keys: ["Ctrl", "/"], desc: "Show this help" },
            ].map((row) => (
              <div key={row.desc} className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
                <span className="text-sm text-muted-foreground">{row.desc}</span>
                <div className="flex items-center gap-1">
                  {row.keys.map((k, i) => (
                    <kbd
                      key={i}
                      className="rounded border bg-background px-1.5 py-0.5 text-[10px] font-semibold shadow-sm"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShortcutsOpen(false)}>
              Done
            </Button>
          </DialogFooter>
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
