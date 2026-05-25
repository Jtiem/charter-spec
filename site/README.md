# Charter site

The static documentation site at [https://usecharter.dev/](https://usecharter.dev/), built with [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/) and deployed to Cloudflare Pages.

This directory is self-contained. Everything Astro touches lives under `site/`. The repo root keeps the canonical spec artifacts — `CHARTER.md`, `EVIDENCE.md`, `PHILOSOPHY.md`, and friends — exactly as adopters see them on GitHub.

## Local development

```bash
cd site
npm install        # one-time
npm run dev        # http://localhost:4321
```

`npm run dev` runs `sync-content` first (see below), then starts Astro's dev server with hot reload.

## Production build

```bash
cd site
npm run build      # writes the site to site/dist/
npm run preview    # serves dist/ locally for sanity-checking
```

The build output is a fully static site — no server runtime, no Node dependency at deploy time.

## How content is sourced from the repo root

The canonical Charter spec lives at the repo root (`/CHARTER.md`, `/EVIDENCE.md`, etc.) because that's the file layout adopters see on GitHub. **The site must not modify those files.**

To bridge that constraint with Starlight's content-collection requirements (every page needs YAML frontmatter, a `title`, and a sidebar position), there's a small build step:

> `site/scripts/sync-content.mjs` — reads each source markdown file from the repo root, synthesizes Starlight frontmatter from the first H1, rewrites in-text relative links (e.g. `(CHARTER.md)` → `/spec/`), and writes a derived copy into `site/src/content/docs/`.

It runs automatically via `prebuild` and `predev` scripts in `package.json`. The derived copies are gitignored (see the repo root `.gitignore`). The source markdown is read-only — the script never writes back.

Three alternatives were considered and rejected:

1. **Symlinks from `site/src/content/docs/` to the root files.** Cleanest in principle, but Starlight's content collection requires every page to have YAML frontmatter with `title:`, and the source files start with a `# Heading` H1 instead. Adding frontmatter to the source files violates the hard constraint. Symlinking without a transform produces validation errors at build time.
2. **A custom Astro content loader that injects frontmatter on read.** Possible, but the implementation surface is large (a full `Loader` implementation that mirrors Astro's `glob()` plus a transform pass), and the failure modes are harder to debug than a 200-line build script.
3. **A `remark` plugin that injects frontmatter into the markdown AST.** Frontmatter is parsed *before* remark runs in Astro's pipeline, so the Zod schema validation has already failed by the time a remark plugin could intervene.

The build-step approach is explicit, debuggable (`npm run sync-content` prints what it wrote), and treats the derived files as the build artifacts they are.

### Files that pass through `public/` instead

A few assets need to be served at fixed URLs, not as Starlight pages. They live as symlinks under `site/public/`:

- `site/public/v1/charter.schema.json` → `../../../v1/charter.schema.json`
  Served at `https://usecharter.dev/v1/charter.schema.json`. This URL is baked into every adopter's `$schema:` field — moving it would break every editor's auto-validator.
- `site/public/examples/*.yaml` → `../../../examples/*.yaml`
  Adopters and copy/paste flows expect the example YAMLs at stable URLs. The `/examples/` Starlight page also renders them inline.

Anything in `public/` is copied verbatim to the build root.

## Cloudflare Pages configuration

Set these in the Cloudflare Pages project settings:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Build command | `cd site && npm install && npm run build` |
| Build output directory | `site/dist` |
| Root directory | `/` (project root, NOT `site/`) |
| Node version | `20` or higher (set via `NODE_VERSION` env var) |

The build command must `cd site` because the Astro project lives in a subdirectory of the repo, but the build directory must remain `/` so the build script can read the canonical markdown at the repo root.

No environment secrets are required. No serverless functions. No analytics scripts. The build is fully static.

## Updating the site

When a spec file at the repo root changes, the site picks it up automatically on the next build. No site code changes required for content edits.

To add or rename a page:

1. Edit `site/scripts/sync-content.mjs` — add the source file to the `PAGES` array and the link to `LINK_MAP`.
2. Edit `site/astro.config.mjs` — add the page to the `sidebar` config.
3. Run `npm run build` to verify.

## File tree

```
site/
  astro.config.mjs           # Astro + Starlight config (theme, sidebar, fonts)
  package.json
  package-lock.json
  README.md                  # this file
  scripts/
    sync-content.mjs         # copies + transforms root markdown into Starlight pages
  public/
    v1/charter.schema.json   # symlink → ../../v1/charter.schema.json
    examples/                # symlinks → ../../examples/*.yaml
  src/
    content.config.ts        # Starlight content collection wiring
    content/docs/
      index.md               # landing page (hand-written)
      examples.md            # examples page (hand-written, inlines all three YAMLs)
      # All other .md files are GENERATED by scripts/sync-content.mjs.
    styles/
      charter.css            # amber accent, Inter + JetBrains Mono, dark-first
  dist/                      # build output (gitignored)
```

## What this site is not

- Not a CMS. Spec edits happen in the root markdown files; the site is a renderer.
- Not a marketing site. No analytics, no telemetry, no third-party scripts.
- Not interactive. The schema validator lives in adopter tooling (any standards-compliant JSON Schema validator), not on this site.
