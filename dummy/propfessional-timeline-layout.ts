/**
 * Professional Timeline — layout configuration.
 * All spacing, sizes, and colors live here. No component below hardcodes values.
 */
export const timelineLayout = {
  // Page (A4 @ 96dpi)
  pageWidth: 794,
  pageHeight: 1123,
  paddingTop: 30,
  paddingBottom: 30,
  paddingLeft: 28,
  paddingRight: 28,

  // Header
  headerHeight: 110,
  avatarSize: 48,
  avatarRadius: 4,
  avatarFontSize: 26,
  nameFontSize: 42,
  emailFontSize: 15,
  headerBottomMargin: 22,

  // Body
  timelineWidth: 170,
  timelineGap: 24,
  sectionGap: 22,
  bulletGap: 6,

  // Timeline glyphs
  timelineDot: 12,
  timelineLine: 2,

  // Typography
  sectionLabelSize: 17,
  sectionHeadingSize: 20,
  bodySize: 14,
  smallSize: 13,
  lineHeight: 1.55,
  fontFamily: "'Roboto', Arial, sans-serif",

  // Colors
  colors: {
    primaryText: "#222222",
    secondaryText: "#666666",
    profileText: "#444444",
    nameText: "#111111",
    emailText: "#555555",
    timelineLine: "#D8D8D8",
    timelineDot: "#F4B400",
    accent: "#7B2CBF",
    divider: "#E5E5E5",
    chipBg: "#F1F1F3",
    chipText: "#333333",
  },
} as const;

export type TimelineLayout = typeof timelineLayout;
