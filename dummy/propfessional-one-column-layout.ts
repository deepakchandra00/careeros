/**
 * Professional One Column — layout configuration.
 */
export const oneColLayout = {
  pageWidth: 794,
  pageHeight: 1123,
  paddingTop: 28,
  paddingBottom: 28,
  paddingLeft: 32,
  paddingRight: 32,

  headerHeight: 130,
  headerBottomGap: 24,
  photoSize: 90,

  sectionGap: 24,
  titleGap: 14,
  projectGap: 20,
  bulletGap: 6,
  contactRowGap: 10,

  nameFontSize: 32,
  jobTitleFontSize: 20,
  sectionHeadingSize: 22,
  bodySize: 14,
  smallSize: 13,
  lineHeight: 1.5,

  fontFamily: "'Inter', Helvetica, Arial, sans-serif",

  colors: {
    primary: "#24364B",
    accent: "#3C7A89",
    border: "#D9D9D9",
    text: "#222222",
    muted: "#6B7280",
    chipBg: "#F1F3F5",
  },
} as const;

export type OneColLayout = typeof oneColLayout;
