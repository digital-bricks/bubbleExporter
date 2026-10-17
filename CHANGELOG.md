# Changelog

## 2026-10-17

### Added

- `converter/bubble2nodegx.mjs` turns a Bubble app into a NodeGX project: pages, elements, layout, styles, workflows,
  expressions, data types, option sets, reusable elements, custom states and the API Connector. It writes
  `docs/IMPORT-REPORT.md` into the project, listing what still needs a person.
- `converter/bubble-run-bundle-to-export.mjs` builds the same input without Bubble's paid export. It reads each page's
  `dynamic.js`, plus three requests saved from the Bubble editor: backend workflows (`c5r6j`), option sets
  (`dxr78ubfdtfq6tbmec`) and data types (`entpawjzehwq0tbk`).
- Backend workflows become cloud functions. Database triggers and recurring events become backend triggers, proposed
  in `backend/triggers.bubble.json`.
- Option sets become a component each, with every attribute. An option is stored by its database value, which is
  what Bubble's expressions name.
- Data types keep their links to other types and their default values. Bubble's User is NodeGX's built-in `_User`.
  Deleted types and fields are skipped.
- `docs/FINDINGS.md`: what converts into what, what was measured, and what doesn't convert yet.
- `docs/GETTING-YOUR-APP.md`: how to collect an app's files on any plan.
- `examples/`: the 2023 test app's paid export, and one of each Bubble editor request from a test app.
- 22 expression operators, among them the list operators (`unique`, `intersect_with`, `minus_list` …), `defaulting_to`
  and `rounded`. They come from Rico Trevisan's [bubble_ex](https://github.com/ricotrevisan/bubble_ex) (MIT).
- The GPL-3.0 licence.

### Changed

- The 2023 study moved to `archive/2023-study/`, with a README of its own. Its `v6` export is now
  `examples/paid-export/test-app-v6.json`.
- The README is rewritten around using the converter.

### Fixed

- *Align to parent* reads Bubble's grid cell horizontal first, then vertical (`ba` is top centre). The converter
  had the two the wrong way round. The order comes from bubble_ex.
- `bubble-run-bundle-to-export.mjs` creates its output folder when it's missing.

## 2023-04-07 to 2023-04-13: the study

Seven exports of a test app, `v0` to `v6`, each one small change apart, with notes on where each change shows in the
JSON. [archive/2023-study/README.md](archive/2023-study/README.md) lists them.
