// Type declarations for bundler-specific import suffixes used by Turbopack/Vite.
// These allow `import x from "pkg/file.mjs?url"` etc. without TS errors.

declare module "*?url" {
  const src: string;
  export default src;
}

declare module "*?worker" {
  const worker: { new (): Worker };
  export default worker;
}
