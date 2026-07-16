"use client";

import * as React from "react";
import { TemplateEditor } from "@/components/modules/template-editor";
import { ModuleHeader } from "@/components/shared/blocks";
import { FileEdit } from "lucide-react";
import { PREMIUM_JSON_TEMPLATES } from "@/lib/resume/premium-json-templates";

const PREMIUM_IMAGES: Record<string, string> = {
  "premium-purple-executive": "/premium-refs/premium-1-purple-executive.png",
  "premium-brown-classic": "/premium-refs/premium-2-brown-classic.png",
  "premium-peach-modern": "/premium-refs/premium-3-peach-modern.png",
  "premium-warm-professional": "/premium-refs/premium-4-warm-professional.png",
  "premium-earth-premium": "/premium-refs/premium-5-earth-premium.png",
  "premium-pink-geometric": "/premium-refs/premium-6-pink-geometric.png",
  "premium-rose-elegant": "/premium-refs/premium-7-rose-elegant.png",
  "premium-foundation-purple": "/premium-refs/premium-8-foundation-purple.png",
  "premium-blue-sidebar": "/premium-refs/premium-9-blue-sidebar.png",
  "premium-aspire-teal": "/premium-refs/premium-10-aspire-teal.png",
  "premium-canva-pink-blue": "/premium-refs/premium-11-canva-pink-blue.png",
  "premium-college-teal": "/premium-refs/premium-12-college-teal.png",
  "premium-combined-blue": "/premium-refs/premium-13-combined-blue.png",
  "premium-navy-yellow": "/premium-refs/premium-14-navy-yellow.png",
};

export function TemplateEditorModule() {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>("premium-purple-executive");
  const template = PREMIUM_JSON_TEMPLATES[selectedTemplate];
  const referenceImage = PREMIUM_IMAGES[selectedTemplate];

  return (
    <div className="space-y-4">
      <ModuleHeader
        icon={FileEdit}
        title="Template Editor"
        description="Calibrate premium templates with pixel-perfect precision using the visual editor"
      >
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
        >
          {Object.keys(PREMIUM_JSON_TEMPLATES).map((id) => (
            <option key={id} value={id}>
              {PREMIUM_JSON_TEMPLATES[id].name}
            </option>
          ))}
        </select>
      </ModuleHeader>

      <div className="rounded-xl border bg-card overflow-hidden">
        <TemplateEditor
          key={selectedTemplate}
          initialTemplate={template}
          referenceImage={referenceImage}
          onSave={(t) => {
            // Update the in-memory template
            PREMIUM_JSON_TEMPLATES[selectedTemplate] = t;
            console.log("Saved template:", t.id, "with", t.elements.length, "elements");
          }}
        />
      </div>
    </div>
  );
}
