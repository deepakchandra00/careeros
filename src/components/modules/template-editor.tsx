"use client";

import * as React from "react";
import { JsonTemplateRenderer, type JsonTemplate, type TemplateElement, type ElementType } from "@/components/modules/json-template-renderer";
import type { ResumeData } from "@/store/resume-store";
import { useResumeStore } from "@/store/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Type, Square, Circle, Image as ImageIcon, Layout, Save,
  Eye, EyeOff, Plus, Trash2, Copy, ChevronDown, ChevronUp,
  MousePointer2, Move, StretchHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CANVAS_W = 794;
const CANVAS_H = 1123;

interface EditorElement extends TemplateElement {
  id: string;
  label: string;
}

const DEFAULT_DATA: ResumeData = {
  name: "Deepak Sharma",
  title: "Senior Frontend Engineer",
  email: "deepak@email.com",
  phone: "+91 98765 43210",
  location: "Bengaluru, India",
  linkedin: "linkedin.com/in/deepak",
  github: "github.com/deepak",
  website: "deepak.dev",
  photo: "",
  summary: "Frontend Engineer with 6+ years building performant web applications.",
  experience: [
    { id: "e1", role: "Senior Engineer", company: "Razorpay", location: "Bangalore", start: "2022", end: "Present", bullets: ["Built React app", "Led migration to Next.js"] },
    { id: "e2", role: "Engineer", company: "Swiggy", location: "Bangalore", start: "2019", end: "2022", bullets: ["Built order tracking", "Optimized performance"] },
  ],
  skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js"],
  skillLevels: { React: 92, TypeScript: 88 },
  projects: [
    { id: "p1", name: "DevMetrics", description: "Analytics dashboard", tech: ["Next.js", "Prisma"], link: "github.com/devmetrics" },
  ],
  education: [
    { id: "ed1", degree: "B.Tech CS", school: "BITS Pilani", location: "Pilani", start: "2015", end: "2019", grade: "8.7 CGPA" },
  ],
  certifications: [{ id: "c1", title: "AWS Certified", subtitle: "Amazon", description: "", date: "2023" }],
  languages: ["English", "Hindi"],
  awards: [{ id: "a1", title: "Spot Award", subtitle: "Razorpay", description: "", date: "2023" }],
  publications: [],
  interests: ["Open Source", "Chess"],
  references: [],
  customSections: [],
  sectionOrder: ["personal", "summary", "experience", "skills", "projects", "education", "certifications", "languages", "awards", "publications", "interests", "references"],
};

let elementIdCounter = 0;
const genId = () => `el-${++elementIdCounter}`;

function createLabel(el: TemplateElement): string {
  if (el.type === "text" && el.content) return el.content.replace(/\{\{|\}\}/g, "").slice(0, 20) || "Text";
  if (el.type === "rect") return `Rect (${el.w}×${el.h})`;
  if (el.type === "photo") return "Photo";
  if (el.type === "section") return el.headerText || el.sectionType || "Section";
  if (el.type === "skills") return "Skills";
  if (el.type === "contact") return "Contact";
  if (el.type === "arc") return "Arc";
  if (el.type === "pattern") return "Pattern";
  return el.type;
}

export function TemplateEditor({
  initialTemplate,
  referenceImage,
  onSave,
}: {
  initialTemplate?: JsonTemplate;
  referenceImage?: string;
  onSave?: (template: JsonTemplate) => void;
}) {
  const storeData = useResumeStore((s) => s.data);
  const data = storeData.name ? storeData : DEFAULT_DATA;

  const [elements, setElements] = React.useState<EditorElement[]>(
    initialTemplate?.elements.map((el, i) => ({ ...el, id: `el-${i}`, label: createLabel(el) })) ?? []
  );
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [showReference, setShowReference] = React.useState(true);
  const [referenceOpacity, setReferenceOpacity] = React.useState(0.7);
  const [zoom, setZoom] = React.useState(0.6);
  const [templateName, setTemplateName] = React.useState(initialTemplate?.name ?? "New Template");

  const canvasRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<{ id: string; startX: number; startY: number; origX: number; origY: number; mode: "move" | "resize" } | null>(null);

  const selected = elements.find((e) => e.id === selectedId);

  // Pointer handlers for drag
  const onPointerDown = (e: React.PointerEvent, id: string, mode: "move" | "resize") => {
    e.stopPropagation();
    setSelectedId(id);
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, origX: el.x, origY: el.y, mode };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { id, startX, startY, origX, origY, mode } = dragRef.current;
    const dx = Math.round((e.clientX - startX) / zoom);
    const dy = Math.round((e.clientY - startY) / zoom);
    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== id) return el;
        if (mode === "move") return { ...el, x: Math.max(0, origX + dx), y: Math.max(0, origY + dy) };
        return { ...el, w: Math.max(20, el.w + dx), h: Math.max(20, el.h + dy) };
      })
    );
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      dragRef.current = null;
    }
  };

  // Add element
  const addElement = (type: ElementType) => {
    const id = genId();
    const defaults: Record<string, Partial<EditorElement>> = {
      rect: { w: 200, h: 100, fill: "#6c5ce7", label: "Rectangle" },
      text: { w: 200, h: 30, content: "New Text", fontSize: 12, color: "#333", label: "Text" },
      photo: { w: 70, h: 70, shape: "circle", label: "Photo" },
      section: { w: 400, h: 200, sectionType: "experience", headerText: "Experience", headerStyle: "plain", headerColor: "#333", label: "Experience" },
      skills: { w: 200, h: 200, skillStyle: "list", headerColor: "#333", headerText: "Skills", label: "Skills" },
      contact: { w: 200, h: 150, color: "#333", headerText: "Contact", label: "Contact" },
      arc: { w: 80, h: 80, stroke: "#ccc", strokeWidth: 2, label: "Arc" },
      pattern: { w: 794, h: 1123, patternType: "hexagons", patternColor: "#6d28d9", patternOpacity: 0.05, label: "Pattern" },
    };
    const el: EditorElement = {
      id, type, x: 100, y: 100, label: "Element",
      ...defaults[type],
    } as EditorElement;
    setElements((prev) => [...prev, el]);
    setSelectedId(id);
  };

  // Update selected element
  const updateSelected = (patch: Partial<EditorElement>) => {
    if (!selectedId) return;
    setElements((prev) => prev.map((el) => (el.id === selectedId ? { ...el, ...patch } : el)));
  };

  // Delete element
  const deleteSelected = () => {
    if (!selectedId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  // Duplicate element
  const duplicateSelected = () => {
    if (!selected) return;
    const id = genId();
    setElements((prev) => [...prev, { ...selected, id, x: selected.x + 20, y: selected.y + 20, label: selected.label + " copy" }]);
    setSelectedId(id);
  };

  // Save template
  const handleSave = () => {
    const template: JsonTemplate = {
      id: templateName.toLowerCase().replace(/\s+/g, "-"),
      name: templateName,
      elements: elements.map(({ id, label, ...rest }) => rest),
    };
    onSave?.(template);
    // Also save to localStorage
    const stored = JSON.parse(localStorage.getItem("careeros-custom-templates") || "[]");
    stored.push(template);
    localStorage.setItem("careeros-custom-templates", JSON.stringify(stored));
    toast.success(`Template "${templateName}" saved!`);
  };

  const moveLayer = (dir: "up" | "down") => {
    if (!selectedId) return;
    setElements((prev) => {
      const idx = prev.findIndex((e) => e.id === selectedId);
      if (idx === -1) return prev;
      const newIdx = dir === "up" ? Math.min(prev.length - 1, idx + 1) : Math.max(0, idx - 1);
      if (newIdx === idx) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  };

  const jsonTemplate: JsonTemplate = React.useMemo(() => ({
    id: "preview",
    name: templateName,
    elements: elements.map(({ id, label, ...rest }) => rest),
  }), [elements, templateName]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left toolbar */}
      <div className="w-14 shrink-0 border-r bg-card p-2 space-y-1">
        <button onClick={() => addElement("rect")} className="grid size-10 w-full place-items-center rounded-lg hover:bg-accent" title="Rectangle">
          <Square className="size-4" />
        </button>
        <button onClick={() => addElement("text")} className="grid size-10 w-full place-items-center rounded-lg hover:bg-accent" title="Text">
          <Type className="size-4" />
        </button>
        <button onClick={() => addElement("photo")} className="grid size-10 w-full place-items-center rounded-lg hover:bg-accent" title="Photo">
          <ImageIcon className="size-4" />
        </button>
        <button onClick={() => addElement("section")} className="grid size-10 w-full place-items-center rounded-lg hover:bg-accent" title="Section">
          <Layout className="size-4" />
        </button>
        <button onClick={() => addElement("skills")} className="grid size-10 w-full place-items-center rounded-lg hover:bg-accent" title="Skills">
          <span className="text-xs font-bold">SK</span>
        </button>
        <button onClick={() => addElement("contact")} className="grid size-10 w-full place-items-center rounded-lg hover:bg-accent" title="Contact">
          <span className="text-xs font-bold">CT</span>
        </button>
        <button onClick={() => addElement("arc")} className="grid size-10 w-full place-items-center rounded-lg hover:bg-accent" title="Arc">
          <Circle className="size-4" />
        </button>
        <button onClick={() => addElement("pattern")} className="grid size-10 w-full place-items-center rounded-lg hover:bg-accent" title="Pattern">
          <span className="text-xs">⬡</span>
        </button>
        <Separator className="my-2" />
        <button onClick={handleSave} className="grid size-10 w-full place-items-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90" title="Save">
          <Save className="size-4" />
        </button>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto bg-muted/30 p-4">
        {/* Top bar */}
        <div className="mb-3 flex items-center gap-3">
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="h-8 w-48 text-sm"
            placeholder="Template name"
          />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setShowReference(!showReference)}>
              {showReference ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              Reference
            </Button>
            {showReference && referenceImage && (
              <Input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={referenceOpacity}
                onChange={(e) => setReferenceOpacity(parseFloat(e.target.value))}
                className="h-8 w-24"
              />
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8" onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}>-</Button>
            <span className="text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" className="h-8" onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))}>+</Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex justify-center">
          <div
            ref={canvasRef}
            className="relative bg-white shadow-2xl"
            style={{
              width: CANVAS_W * zoom,
              height: CANVAS_H * zoom,
            }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {/* Scaled inner canvas */}
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                width: CANVAS_W,
                height: CANVAS_H,
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              {/* Reference image overlay */}
              {showReference && referenceImage && (
                <img
                  src={referenceImage}
                  alt="Reference"
                  className="pointer-events-none absolute inset-0"
                  style={{ width: CANVAS_W, height: CANVAS_H, objectFit: "fill", opacity: referenceOpacity, zIndex: 2 }}
                />
              )}

              {/* Rendered preview (behind editable elements) */}
              <div className="pointer-events-none absolute inset-0" style={{ zIndex: 1 }}>
                <JsonTemplateRenderer template={jsonTemplate} data={data} sections={{}} accent="" />
              </div>

              {/* Editable element overlays */}
              {elements.map((el) => (
                <div
                  key={el.id}
                  onPointerDown={(e) => onPointerDown(e, el.id, "move")}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                  className={cn(
                    "absolute cursor-move border-2 transition-colors",
                    selectedId === el.id ? "border-primary z-50" : "border-transparent hover:border-primary/30 z-10"
                  )}
                  style={{
                    left: el.x,
                    top: el.y,
                    width: el.w,
                    height: el.h,
                  }}
                >
                  {/* Label badge */}
                  <div className="pointer-events-none absolute -top-5 left-0 rounded bg-primary px-1.5 py-0.5 text-[9px] font-medium text-primary-foreground opacity-0 group-hover:opacity-100" style={{ opacity: selectedId === el.id ? 1 : 0 }}>
                    {el.label}
                  </div>

                  {/* Resize handle */}
                  {selectedId === el.id && (
                    <div
                      onPointerDown={(e) => onPointerDown(e, el.id, "resize")}
                      className="absolute -bottom-1.5 -right-1.5 size-3 cursor-nwse-resize rounded-full border-2 border-primary bg-white"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right properties panel */}
      <div className="w-64 shrink-0 overflow-y-auto border-l bg-card p-3 scroll-thin">
        {selected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{selected.label}</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="size-7" onClick={() => moveLayer("up")}>
                  <ChevronUp className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7" onClick={() => moveLayer("down")}>
                  <ChevronDown className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7" onClick={duplicateSelected}>
                  <Copy className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={deleteSelected}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">X</Label>
                <Input type="number" value={selected.x} onChange={(e) => updateSelected({ x: parseInt(e.target.value) || 0 })} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[10px]">Y</Label>
                <Input type="number" value={selected.y} onChange={(e) => updateSelected({ y: parseInt(e.target.value) || 0 })} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[10px]">Width</Label>
                <Input type="number" value={selected.w} onChange={(e) => updateSelected({ w: parseInt(e.target.value) || 20 })} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[10px]">Height</Label>
                <Input type="number" value={selected.h} onChange={(e) => updateSelected({ h: parseInt(e.target.value) || 20 })} className="h-8 text-xs" />
              </div>
            </div>

            <Separator />

            {/* Type-specific properties */}
            {selected.type === "rect" && (
              <div>
                <Label className="text-[10px]">Fill Color</Label>
                <div className="flex gap-1.5">
                  <input type="color" value={selected.fill || "#000000"} onChange={(e) => updateSelected({ fill: e.target.value })} className="size-8 rounded border" />
                  <Input value={selected.fill || ""} onChange={(e) => updateSelected({ fill: e.target.value })} className="h-8 text-xs" />
                </div>
              </div>
            )}

            {selected.type === "text" && (
              <>
                <div>
                  <Label className="text-[10px]">Content</Label>
                  <Textarea value={selected.content || ""} onChange={(e) => updateSelected({ content: e.target.value })} className="text-xs" rows={2} />
                  <p className="mt-1 text-[9px] text-muted-foreground">Use {"{{name}}"}, {"{{title}}"}, {"{{email}}"} etc. for data binding</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px]">Font Size</Label>
                    <Input type="number" value={selected.fontSize || 10} onChange={(e) => updateSelected({ fontSize: parseInt(e.target.value) || 10 })} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px]">Weight</Label>
                    <Input type="number" value={selected.fontWeight || 400} onChange={(e) => updateSelected({ fontWeight: parseInt(e.target.value) || 400 })} className="h-8 text-xs" />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px]">Color</Label>
                  <div className="flex gap-1.5">
                    <input type="color" value={selected.color || "#333333"} onChange={(e) => updateSelected({ color: e.target.value })} className="size-8 rounded border" />
                    <Input value={selected.color || ""} onChange={(e) => updateSelected({ color: e.target.value })} className="h-8 text-xs" />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px]">Align</Label>
                  <div className="flex gap-1">
                    {(["left", "center", "right"] as const).map((a) => (
                      <button key={a} onClick={() => updateSelected({ align: a })} className={cn("rounded px-2 py-1 text-[10px]", selected.align === a ? "bg-primary text-primary-foreground" : "bg-muted")}>{a}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selected.type === "photo" && (
              <div>
                <Label className="text-[10px]">Shape</Label>
                <div className="flex gap-1">
                  {(["circle", "diamond", "square"] as const).map((s) => (
                    <button key={s} onClick={() => updateSelected({ shape: s })} className={cn("rounded px-2 py-1 text-[10px]", selected.shape === s ? "bg-primary text-primary-foreground" : "bg-muted")}>{s}</button>
                  ))}
                </div>
                <div className="mt-2">
                  <Label className="text-[10px]">Border Color</Label>
                  <input type="color" value={selected.border || "#000000"} onChange={(e) => updateSelected({ border: e.target.value })} className="size-8 rounded border" />
                </div>
              </div>
            )}

            {(selected.type === "section" || selected.type === "skills" || selected.type === "contact") && (
              <>
                {selected.type === "section" && (
                  <>
                    <div>
                      <Label className="text-[10px]">Section Type</Label>
                      <select value={selected.sectionType || "experience"} onChange={(e) => updateSelected({ sectionType: e.target.value as TemplateElement["sectionType"] })} className="w-full rounded border h-8 text-xs">
                        <option value="experience">Experience</option>
                        <option value="projects">Projects</option>
                        <option value="education">Education</option>
                        <option value="certifications">Certifications</option>
                        <option value="awards">Awards</option>
                        <option value="languages">Languages</option>
                        <option value="interests">Interests</option>
                        <option value="references">References</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-[10px]">Header Text</Label>
                      <Input value={selected.headerText || ""} onChange={(e) => updateSelected({ headerText: e.target.value })} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Header Style</Label>
                      <select value={selected.headerStyle || "plain"} onChange={(e) => updateSelected({ headerStyle: e.target.value as TemplateElement["headerStyle"] })} className="w-full rounded border h-8 text-xs">
                        <option value="plain">Plain</option>
                        <option value="bar">Bar</option>
                        <option value="pill">Pill</option>
                        <option value="underline">Underline</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-[10px]">Header Color</Label>
                      <input type="color" value={selected.headerColor || "#333333"} onChange={(e) => updateSelected({ headerColor: e.target.value })} className="size-8 rounded border" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Bullet Character</Label>
                      <Input value={selected.bulletChar || "•"} onChange={(e) => updateSelected({ bulletChar: e.target.value })} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Bullet Color</Label>
                      <input type="color" value={selected.bulletColor || "#333333"} onChange={(e) => updateSelected({ bulletColor: e.target.value })} className="size-8 rounded border" />
                    </div>
                  </>
                )}
                {selected.type === "skills" && (
                  <div>
                    <Label className="text-[10px]">Skill Style</Label>
                    <select value={selected.skillStyle || "list"} onChange={(e) => updateSelected({ skillStyle: e.target.value as TemplateElement["skillStyle"] })} className="w-full rounded border h-8 text-xs">
                      <option value="list">List</option>
                      <option value="chips">Chips</option>
                      <option value="bars">Bars</option>
                      <option value="dots">Dot Ratings</option>
                    </select>
                  </div>
                )}
                <div>
                  <Label className="text-[10px]">Header Color</Label>
                  <input type="color" value={selected.headerColor || "#333333"} onChange={(e) => updateSelected({ headerColor: e.target.value })} className="size-8 rounded border" />
                </div>
              </>
            )}

            {selected.type === "arc" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">Stroke</Label>
                  <input type="color" value={selected.stroke || "#cccccc"} onChange={(e) => updateSelected({ stroke: e.target.value })} className="size-8 rounded border" />
                </div>
                <div>
                  <Label className="text-[10px]">Width</Label>
                  <Input type="number" value={selected.strokeWidth || 2} onChange={(e) => updateSelected({ strokeWidth: parseInt(e.target.value) || 2 })} className="h-8 text-xs" />
                </div>
              </div>
            )}

            {selected.type === "pattern" && (
              <>
                <div>
                  <Label className="text-[10px]">Pattern Type</Label>
                  <select value={selected.patternType || "hexagons"} onChange={(e) => updateSelected({ patternType: e.target.value as TemplateElement["patternType"] })} className="w-full rounded border h-8 text-xs">
                    <option value="hexagons">Hexagons</option>
                    <option value="dots">Dots</option>
                    <option value="stripes">Stripes</option>
                  </select>
                </div>
                <div>
                  <Label className="text-[10px]">Color</Label>
                  <input type="color" value={selected.patternColor || "#6d28d9"} onChange={(e) => updateSelected({ patternColor: e.target.value })} className="size-8 rounded border" />
                </div>
                <div>
                  <Label className="text-[10px]">Opacity</Label>
                  <Input type="number" step="0.01" min="0" max="1" value={selected.patternOpacity ?? 0.05} onChange={(e) => updateSelected({ patternOpacity: parseFloat(e.target.value) || 0 })} className="h-8 text-xs" />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <MousePointer2 className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Select an element to edit its properties, or add a new element from the left toolbar.
            </p>
            <p className="text-xs text-muted-foreground">
              Drag elements to position them. Use the reference image to match the original design.
            </p>
          </div>
        )}

        {/* Element list */}
        {elements.length > 0 && (
          <>
            <Separator className="my-3" />
            <p className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">Layers ({elements.length})</p>
            <div className="space-y-1">
              {elements.slice().reverse().map((el) => (
                <button
                  key={el.id}
                  onClick={() => setSelectedId(el.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors",
                    selectedId === el.id ? "bg-primary/10 text-primary" : "hover:bg-accent"
                  )}
                >
                  <span className="size-2 shrink-0 rounded-full" style={{ background: el.fill || el.headerColor || el.color || el.stroke || "#ccc" }} />
                  <span className="flex-1 truncate">{el.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
