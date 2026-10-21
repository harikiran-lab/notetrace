# Licenses & Data Sources

NoteTrace's source code is licensed under [AGPL-3.0](LICENSE). This file lists anything bundled or connected to that carries its own license, so operators and contributors know what applies to what.

## Code

- **NoteTrace**: AGPL-3.0 (see [LICENSE](LICENSE)). Applies to the entire codebase in this repository including the Android app source.

## Bundled assets

| Asset | License | Where |
| ----- | ------- | ----- |
| **Inter** (UI typeface) | [SIL Open Font License 1.1][ofl] | `public/fonts/inter-*.woff2` |
| **Newsreader** (note title typeface) | [SIL Open Font License 1.1][ofl] | `public/fonts/newsreader-*.woff2` |
| **Manrope** | [SIL Open Font License 1.1][ofl] | `public/fonts/manrope-*.woff2`, `public/fonts/manrope-OFL.txt` |
| **Nunito Sans** | [SIL Open Font License 1.1][ofl] | `public/fonts/nunito-sans-*.woff2`, `public/fonts/nunito-sans-OFL.txt` |
| **Lora** | [SIL Open Font License 1.1][ofl] | `public/fonts/lora-*.woff2`, `public/fonts/lora-OFL.txt` |
| **Roboto Mono** | [SIL Open Font License 1.1][ofl] | `public/fonts/roboto-mono-*.woff2`, `public/fonts/roboto-mono-OFL.txt` |
| **DM Sans** | [SIL Open Font License 1.1][ofl] | `public/fonts/dm-sans-*.woff2`, `public/fonts/dm-sans-OFL.txt` |
| **Plus Jakarta Sans** | [SIL Open Font License 1.1][ofl] | `public/fonts/jakarta-*.woff2`, `public/fonts/jakarta-OFL.txt` |
| **Outfit** | [SIL Open Font License 1.1][ofl] | `public/fonts/outfit-*.woff2`, `public/fonts/outfit-OFL.txt` |
| **Work Sans** | [SIL Open Font License 1.1][ofl] | `public/fonts/work-sans-*.woff2`, `public/fonts/work-sans-OFL.txt` |
| **Source Sans 3** | [SIL Open Font License 1.1][ofl] | `public/fonts/source-sans-*.woff2`, `public/fonts/source-sans-OFL.txt` |
| **Roboto** | [SIL Open Font License 1.1][ofl] | `public/fonts/roboto-*.woff2`, `public/fonts/roboto-OFL.txt` |
| **Open Sans** | [SIL Open Font License 1.1][ofl] | `public/fonts/open-sans-*.woff2`, `public/fonts/open-sans-OFL.txt` |
| **Montserrat** | [SIL Open Font License 1.1][ofl] | `public/fonts/montserrat-*.woff2`, `public/fonts/montserrat-OFL.txt` |
| **Raleway** | [SIL Open Font License 1.1][ofl] | `public/fonts/raleway-*.woff2`, `public/fonts/raleway-OFL.txt` |
| **Rubik** | [SIL Open Font License 1.1][ofl] | `public/fonts/rubik-*.woff2`, `public/fonts/rubik-OFL.txt` |
| **Lexend** | [SIL Open Font License 1.1][ofl] | `public/fonts/lexend-*.woff2`, `public/fonts/lexend-OFL.txt` |
| **Figtree** | [SIL Open Font License 1.1][ofl] | `public/fonts/figtree-*.woff2`, `public/fonts/figtree-OFL.txt` |
| **Merriweather** | [SIL Open Font License 1.1][ofl] | `public/fonts/merriweather-*.woff2`, `public/fonts/merriweather-OFL.txt` |
| **Source Serif 4** | [SIL Open Font License 1.1][ofl] | `public/fonts/source-serif-*.woff2`, `public/fonts/source-serif-OFL.txt` |
| **Literata** | [SIL Open Font License 1.1][ofl] | `public/fonts/literata-*.woff2`, `public/fonts/literata-OFL.txt` |
| **Cormorant Garamond** | [SIL Open Font License 1.1][ofl] | `public/fonts/cormorant-*.woff2`, `public/fonts/cormorant-OFL.txt` |
| **Bitter** | [SIL Open Font License 1.1][ofl] | `public/fonts/bitter-*.woff2`, `public/fonts/bitter-OFL.txt` |
| **JetBrains Mono** | [SIL Open Font License 1.1][ofl] | `public/fonts/jetbrains-*.woff2`, `public/fonts/jetbrains-OFL.txt` |
| **Inconsolata** | [SIL Open Font License 1.1][ofl] | `public/fonts/inconsolata-*.woff2`, `public/fonts/inconsolata-OFL.txt` |
| **Fira Code** | [SIL Open Font License 1.1][ofl] | `public/fonts/fira-code-*.woff2`, `public/fonts/fira-code-OFL.txt` |
| **Material Symbols Rounded** | [Apache License 2.0][apache] | `public/fonts/material-symbols-rounded.woff2` |

Fonts are served by your own instance, never from a CDN. One file per script
subset, so a browser downloads only the scripts a page needs. Regenerate them
with `scripts/fetch-fonts.mjs`.

[ofl]: https://openfontlicense.org/
[apache]: https://www.apache.org/licenses/LICENSE-2.0

## Your data

Notes, checklists, and attachments are created by the user and owned by whoever runs the instance. NoteTrace does not bundle any third-party content database.

## Third-party code dependencies

Bundled Node.js dependencies (Express, better-sqlite3, Svelte, Capacitor plugins, etc.) each carry their own permissive licenses (MIT / Apache-2.0 / BSD variants). See `package.json` and `server/package.json` for the full dependency lists; run `npm ls --long` or `npx license-checker` in either directory for machine-readable output.

## Questions

If any of the above needs clarification or you spot something worth correcting, open an issue on the [GitHub repository][repo].

[repo]: https://github.com/TraceApps/notetrace/issues
