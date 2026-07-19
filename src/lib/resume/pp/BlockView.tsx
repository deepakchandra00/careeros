// Block renderer. Pure presentation: given a Block, draw it.
// The same component is used by the measurement pass and the on-page render,
// which guarantees measurement matches rendered layout exactly.

import type { CSSProperties } from "react";
import { Mail, Phone, MapPin, Globe, Link as LinkIcon } from "lucide-react";
import type { Block } from "./model";
import type { Theme, Spacing } from "./templates";
import type { Resume } from "./schema";

type Ctx = {
  theme: Theme;
  spacing: Spacing;
  variant: "main" | "sidebar" | "header";
};

function sectionTitleStyle(theme: Theme, variant: Ctx["variant"]): CSSProperties {
  const base: CSSProperties = {
    fontFamily: "var(--r-heading-font)",
    fontWeight: theme.headingWeight,
    color: variant === "sidebar" && theme.sidebarBg !== "transparent" ? theme.sidebarText : theme.primary,
    fontSize: `${theme.baseSize + 1.5}px`,
    letterSpacing: theme.sectionTitleTransform === "uppercase" ? "0.08em" : "normal",
    textTransform: theme.sectionTitleTransform,
    margin: 0,
    paddingBottom: 4,
    lineHeight: 1.2,
  };
  if (theme.sectionTitleStyle === "underline") {
    return { ...base, borderBottom: `1px solid ${theme.divider}`, paddingBottom: 3 };
  }
  if (theme.sectionTitleStyle === "bar") {
    return {
      ...base,
      paddingLeft: 10,
      borderLeft: theme.accentBar ? `3px solid ${theme.accent}` : "none",
    };
  }
  if (theme.sectionTitleStyle === "chip") {
    return {
      ...base,
      display: "inline-block",
      background: theme.accent,
      color: "#fff",
      padding: "3px 10px",
      borderRadius: theme.radius,
    };
  }
  return base;
}

function bulletChar(theme: Theme): string {
  if (theme.bulletStyle === "dash") return "–";
  if (theme.bulletStyle === "square") return "▪";
  return "•";
}

// Photo element (CareerOS extension). Renders only when the profile has a photo
// data URL and the theme's photoShape is not "none".
function Photo({
  profile,
  theme,
  size,
}: {
  profile: Resume["profile"];
  theme: Theme;
  size: number;
}) {
  if (theme.photoShape === "none" || !profile.photo) return null;
  return (
    <img
      src={profile.photo}
      alt={profile.fullName || "Profile photo"}
      style={{
        width: size,
        height: size,
        borderRadius: theme.photoShape === "circle" ? "50%" : theme.radius,
        objectFit: "cover",
        flexShrink: 0,
        border: `2px solid ${theme.accent}33`,
      }}
    />
  );
}

// Avatar element — shows the person's initial in a circle or square when no
// photo is available and theme.avatarInitial is true.
function Avatar({
  profile,
  theme,
  size,
}: {
  profile: Resume["profile"];
  theme: Theme;
  size?: number;
}) {
  const s = size ?? theme.avatarSize;
  const initial = (profile.fullName || "?").trim().charAt(0).toUpperCase();
  return (
    <div
      aria-hidden
      style={{
        width: s,
        height: s,
        borderRadius: theme.avatarShape === "circle" ? "50%" : theme.radius,
        background: theme.chipBg,
        color: theme.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: s * 0.38,
        fontWeight: 700,
        lineHeight: 1,
        flexShrink: 0,
        border: `1px solid ${theme.divider}`,
      }}
    >
      {initial}
    </div>
  );
}

// PhotoOrAvatar — shows a photo if available, else an initial avatar (if enabled).
function PhotoOrAvatar({
  profile,
  theme,
  size,
}: {
  profile: Resume["profile"];
  theme: Theme;
  size: number;
}) {
  if (profile.photo && theme.photoShape !== "none") {
    return <Photo profile={profile} theme={theme} size={size} />;
  }
  if (theme.avatarInitial) {
    return <Avatar profile={profile} theme={theme} size={size} />;
  }
  return null;
}

// Chip element — for skills / tech tags.
function Chip({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: Theme;
}) {
  if (theme.chipStyle === "none") return <>{children}</>;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "8px 12px",
        borderRadius: theme.chipStyle === "pill" ? 999 : 6,
        background: theme.chipBg,
        color: theme.chipText,
        fontSize: 13,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}

export function BlockView({ block, ctx }: { block: Block; ctx: Ctx }) {
  const { theme, spacing, variant } = ctx;
  const isSidebarTinted = variant === "sidebar" && theme.sidebarBg !== "transparent";
  const textColor = isSidebarTinted ? theme.sidebarText : theme.text;
  const mutedColor = isSidebarTinted ? theme.sidebarText : theme.muted;

  switch (block.kind) {
    case "sectionTitle":
      return <h2 style={sectionTitleStyle(theme, variant)}>{block.text}</h2>;

    case "profileHeader": {
      return (
        <ProfileHeader
          profile={block.profile}
          summary={block.summary}
          theme={theme}
          mutedColor={mutedColor}
        />
      );
    }

    case "contactStack": {
      const p = block.profile;
      const hasPhoto = theme.photoShape !== "none" && Boolean(p.photo);
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {hasPhoto && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
              <Photo profile={p} theme={theme} size={64} />
            </div>
          )}
          <div
            style={{
              fontFamily: "var(--r-heading-font)",
              fontSize: `${theme.baseSize + 8}px`,
              fontWeight: theme.headingWeight,
              color: isSidebarTinted ? theme.sidebarText : theme.primary,
              lineHeight: 1.15,
              textAlign: hasPhoto ? "center" : "left",
            }}
          >
            {p.fullName || "Your Name"}
          </div>
          {p.headline && (
            <div
              style={{
                fontSize: `${theme.baseSize}px`,
                color: isSidebarTinted ? theme.sidebarText : theme.accent,
                fontWeight: 500,
                textAlign: hasPhoto ? "center" : "left",
              }}
            >
              {p.headline}
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              color: mutedColor,
              fontSize: `${theme.baseSize - 0.5}px`,
              marginTop: 4,
            }}
          >
            {p.email && (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Mail size={11} /> {p.email}
              </span>
            )}
            {p.phone && (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Phone size={11} /> {p.phone}
              </span>
            )}
            {p.location && (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={11} /> {p.location}
              </span>
            )}
            {p.website && (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Globe size={11} /> {p.website}
              </span>
            )}
            {p.links.map((l, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <LinkIcon size={11} /> {l.label}: {l.url}
              </span>
            ))}
          </div>
        </div>
      );
    }

    case "summary":
      return (
        <p
          style={{
            margin: 0,
            fontSize: `${theme.baseSize}px`,
            lineHeight: 1.5,
            color: textColor,
          }}
        >
          {block.text}
        </p>
      );

    case "entry":
    case "entryContinuation": {
      const entry = block.entry;
      const bullets =
        block.kind === "entryContinuation" ? block.bullets : entry.bullets;
      const showHeader = block.kind === "entry" || block.showTitle;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {showHeader && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "baseline",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--r-heading-font)",
                    fontSize: `${theme.baseSize + 0.5}px`,
                    fontWeight: 600,
                    color: textColor,
                  }}
                >
                  {entry.title}
                  {block.kind === "entryContinuation" && (
                    <span style={{ fontWeight: 400, color: mutedColor }}> (cont.)</span>
                  )}
                </div>
                {entry.meta && (
                  <div
                    style={{
                      fontSize: `${theme.baseSize - 0.5}px`,
                      color: mutedColor,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {entry.meta}
                  </div>
                )}
              </div>
              {(entry.subtitle || entry.metaSub) && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    fontSize: `${theme.baseSize - 0.5}px`,
                    color: mutedColor,
                  }}
                >
                  <span>{entry.subtitle}</span>
                  {entry.metaSub && <span>{entry.metaSub}</span>}
                </div>
              )}
            </>
          )}
          {entry.description && showHeader && (
            <p
              style={{
                margin: "2px 0 0",
                fontSize: `${theme.baseSize}px`,
                lineHeight: 1.45,
                color: textColor,
              }}
            >
              {entry.description}
            </p>
          )}
          {bullets.length > 0 && (
            <ul
              style={{
                margin: "4px 0 0",
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: spacing.bulletGap,
              }}
            >
              {bullets.map((b, i) => (
                <li
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "12px 1fr",
                    gap: 6,
                    fontSize: `${theme.baseSize}px`,
                    lineHeight: 1.45,
                    color: textColor,
                  }}
                >
                  <span style={{ color: theme.accent, lineHeight: 1.45 }}>
                    {bulletChar(theme)}
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
          {entry.tech.length > 0 && showHeader && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginTop: 4,
              }}
            >
              {entry.tech.map((t, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: `${theme.baseSize - 1.5}px`,
                    padding: "2px 6px",
                    background: `${theme.accent}14`,
                    color: theme.accent,
                    borderRadius: theme.radius,
                    lineHeight: 1.2,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "skillGroup":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div
            style={{
              fontSize: `${theme.baseSize - 0.5}px`,
              fontWeight: 600,
              color: isSidebarTinted ? theme.sidebarText : theme.primary,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {block.category}
          </div>
          <div
            style={{
              fontSize: `${theme.baseSize}px`,
              color: textColor,
              lineHeight: 1.45,
            }}
          >
            {block.items.join(", ")}
          </div>
        </div>
      );

    case "skillGrid":
      // When chipStyle is enabled, render each skill as a chip (matching the
      // Professional One Column / Timeline templates from the dummy/ folder).
      if (theme.chipStyle !== "none") {
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {block.groups.map((g, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: theme.muted,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  {g.category}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {g.items.map((s, j) => (
                    <Chip key={j} theme={theme}>{s}</Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      }
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            columnGap: 14,
            rowGap: 4,
          }}
        >
          {block.groups.map((g, i) => (
            <div key={i} style={{ display: "contents" }}>
              <div
                style={{
                  fontSize: `${theme.baseSize - 0.5}px`,
                  fontWeight: 600,
                  color: theme.primary,
                  whiteSpace: "nowrap",
                }}
              >
                {g.category}
              </div>
              <div
                style={{
                  fontSize: `${theme.baseSize}px`,
                  color: textColor,
                  lineHeight: 1.45,
                }}
              >
                {g.items.join(", ")}
              </div>
            </div>
          ))}
        </div>
      );

    case "chipList":
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {block.items.map((it, i) => (
            <span
              key={i}
              style={{
                fontSize: `${theme.baseSize - 1}px`,
                padding: "2px 8px",
                borderRadius: theme.radius,
                background: `${theme.accent}18`,
                color: theme.accent,
              }}
            >
              {it}
            </span>
          ))}
        </div>
      );

    case "keyValueList":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {block.rows.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                fontSize: `${theme.baseSize}px`,
                color: textColor,
                lineHeight: 1.4,
              }}
            >
              <span style={{ fontWeight: 500 }}>{r.key}</span>
              {r.value && (
                <span style={{ color: mutedColor, textAlign: "right" }}>
                  {r.value}
                </span>
              )}
            </div>
          ))}
        </div>
      );

    case "textLine":
      return (
        <div
          style={{
            fontSize: `${theme.baseSize}px`,
            color: block.muted ? mutedColor : textColor,
            lineHeight: 1.45,
          }}
        >
          {block.text}
        </div>
      );

    case "divider":
      return (
        <div style={{ height: 1, background: theme.divider, width: "100%" }} />
      );
  }
}

// ── Profile header renderer (with ATS Pro profileStyle branches) ───────────

function ProfileHeader({
  profile,
  summary,
  theme,
  mutedColor,
}: {
  profile: Resume["profile"];
  summary?: string;
  theme: Theme;
  mutedColor: string;
}) {
  const p = profile;
  const contactItems = [
    p.email && { icon: Mail, text: p.email },
    p.phone && { icon: Phone, text: p.phone },
    p.location && { icon: MapPin, text: p.location },
    p.website && { icon: Globe, text: p.website },
    ...p.links.map((l) => ({ icon: LinkIcon, text: `${l.label}: ${l.url}` })),
  ].filter(Boolean) as { icon: typeof Mail; text: string }[];

  // ── Pro 3-column: name+summary | avatar | contacts ──
  if (theme.profileStyle === "pro-3col") {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "55% 15% 30%",
          alignItems: "center",
          gap: 16,
          paddingBottom: 20,
          borderBottom: `1px solid ${theme.divider}`,
          marginBottom: 20,
        }}
      >
        {/* Left: name + title + summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontFamily: "var(--r-heading-font)",
              fontSize: `${theme.baseSize + 18}px`,
              fontWeight: theme.headingWeight,
              color: theme.primary,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            {p.fullName || "Your Name"}
          </div>
          {p.headline && (
            <div
              style={{
                fontSize: `${theme.baseSize + 6}px`,
                fontWeight: 500,
                color: theme.accent,
              }}
            >
              {p.headline}
            </div>
          )}
          {summary && (
            <p
              style={{
                margin: "8px 0 0",
                fontSize: `${theme.baseSize}px`,
                lineHeight: 1.55,
                color: theme.text,
                width: "95%",
                display: "-webkit-box",
                WebkitLineClamp: 7,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {summary}
            </p>
          )}
        </div>

        {/* Center: avatar (photo or initial) */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <PhotoOrAvatar profile={p} theme={theme} size={theme.avatarSize} />
        </div>

        {/* Right: contact rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "flex-end",
          }}
        >
          {contactItems.map((it, i) => (
            <span
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: theme.text,
              }}
            >
              <span style={{ color: theme.accent, display: "inline-flex" }}>
                <it.icon size={14} strokeWidth={1.6} />
              </span>
              <span style={{ wordBreak: "break-word" }}>{it.text}</span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  // ── Timeline header: centered avatar + name + email ──
  if (theme.profileStyle === "timeline-header") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          paddingBottom: 20,
          borderBottom: `1px solid ${theme.divider}`,
          marginBottom: 24,
        }}
      >
        <PhotoOrAvatar profile={p} theme={theme} size={theme.avatarSize} />
        <div
          style={{
            fontFamily: "var(--r-heading-font)",
            fontSize: `${theme.baseSize + 28}px`,
            fontWeight: theme.headingWeight,
            color: theme.primary,
            lineHeight: 1.1,
            letterSpacing: "-0.5px",
            textAlign: "center",
          }}
        >
          {p.fullName || "Your Name"}
        </div>
        {p.headline && (
          <div
            style={{
              fontSize: `${theme.baseSize + 3}px`,
              fontWeight: 500,
              color: theme.accent,
              textAlign: "center",
            }}
          >
            {p.headline}
          </div>
        )}
        {contactItems.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px 14px",
              justifyContent: "center",
              color: mutedColor,
              fontSize: `${theme.baseSize + 1}px`,
              marginTop: 4,
            }}
          >
            {contactItems.map((it, i) => (
              <span
                key={i}
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                <it.icon size={13} strokeWidth={1.6} />
                <span>{it.text}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Plain profile header (default) ──
  const hasPhoto = theme.photoShape !== "none" && Boolean(p.photo);
  const hasAvatar = theme.avatarInitial;
  const showLeftVisual = hasPhoto || hasAvatar;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: showLeftVisual ? 14 : 0 }}>
        {showLeftVisual && <PhotoOrAvatar profile={p} theme={theme} size={56} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              fontFamily: "var(--r-heading-font)",
              fontSize: `${theme.baseSize + 12}px`,
              fontWeight: theme.headingWeight,
              color: theme.primary,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            {p.fullName || "Your Name"}
          </div>
          {p.headline && (
            <div
              style={{
                fontFamily: "var(--r-body-font)",
                fontSize: `${theme.baseSize + 1}px`,
                color: theme.accent,
                fontWeight: 500,
              }}
            >
              {p.headline}
            </div>
          )}
        </div>
      </div>
      {contactItems.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px 14px",
            color: mutedColor,
            fontSize: `${theme.baseSize - 0.5}px`,
            marginTop: 2,
          }}
        >
          {contactItems.map((it, i) => (
            <span
              key={i}
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <it.icon size={11} strokeWidth={2} />
              <span>{it.text}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
