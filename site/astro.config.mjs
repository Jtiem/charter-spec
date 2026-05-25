// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://usecharter.dev",
  integrations: [
    starlight({
      title: "Charter",
      description:
        "A portable, AI-readable, machine-validatable design system contract. A DESIGN.md you can fail the build on.",
      // Title text alone is the wordmark — no logo image.
      customCss: ["./src/styles/charter.css"],
      // Dark theme is the default; the toggle is rendered automatically.
      // Light mode is supported, but the site is tuned for dark first.
      social: {
        github: "https://github.com/Jtiem/charter-spec",
      },
      editLink: {
        baseUrl: "https://github.com/Jtiem/charter-spec/edit/main/site/",
      },
      lastUpdated: false,
      pagination: true,
      sidebar: [
        {
          label: "Spec",
          items: [
            { label: "Charter v1 (spec)", link: "/spec/" },
            { label: "Evidence", link: "/evidence/" },
            { label: "Measurement plan", link: "/measurement-plan/" },
          ],
        },
        {
          label: "Background",
          items: [
            { label: "Philosophy", link: "/philosophy/" },
            { label: "Comparison", link: "/comparison/" },
          ],
        },
        {
          label: "Adoption",
          items: [
            { label: "Examples", link: "/examples/" },
            {
              label: "Converters",
              items: [
                { label: "Overview", link: "/converters/" },
                { label: "DESIGN.md → Charter", link: "/converters/design-md/" },
                {
                  label: "Converter spec",
                  link: "/converters/design-md-spec/",
                },
              ],
            },
          ],
        },
        {
          label: "Project",
          items: [
            { label: "Changelog", link: "/changelog/" },
            { label: "Contributing", link: "/contributing/" },
            {
              label: "Schema (JSON)",
              link: "/v1/charter.schema.json",
              attrs: { target: "_blank", rel: "noopener" },
            },
          ],
        },
      ],
      head: [
        // Preconnect to Google Fonts for Inter + JetBrains Mono.
        {
          tag: "link",
          attrs: { rel: "preconnect", href: "https://fonts.googleapis.com" },
        },
        {
          tag: "link",
          attrs: {
            rel: "preconnect",
            href: "https://fonts.gstatic.com",
            crossorigin: "",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
          },
        },
        // OpenGraph + Twitter card defaults. Per-page values can override.
        {
          tag: "meta",
          attrs: { property: "og:type", content: "website" },
        },
        {
          tag: "meta",
          attrs: { name: "twitter:card", content: "summary_large_image" },
        },
      ],
      components: {
        // No component overrides yet. Hook here if Starlight defaults
        // need replacement (e.g. Hero, Header, Sidebar).
      },
    }),
  ],
  markdown: {
    // Use Starlight's defaults (Shiki for syntax highlighting). The custom
    // sync-content step normalizes link targets before markdown processing,
    // so no remark plugin is needed here.
  },
});
