# Changelog

## 2026-10-17, evening

### Added

- `nodegx.security.json` is written beside the project file: privacy rules become read rules, the app's own
  *Create / Make changes / Delete* steps become the create, update and delete rules (the widest condition a step ran
  under is the floor), a backend workflow that writes runs as `system`. The import report has a *Security* section
  listing every rule read, every step that writes and the condition it ran under. See `docs/FINDINGS.md`.

### Fixed

- A *Make changes to a thing* or *Delete a thing* step with no explicit type named its collection after the
  expression's node kind (`Message`) or `thing`. The converter now works the type out: a repeating group's row, the
  nearest group with a type, a reusable element's type of content, the result of an earlier step, an element's type
  or data source, the workflow's thing, a parameter, a search, or a field's type. On one production app 111 of 216
  such steps were wrong; 4 remain (they read an element that is not in the export).

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
- `converter/bubble-data-to-nodegx.mjs` turns the Data tab's exports (JSON or CSV) into files the NodeGX backend
  imports, one per collection. Values are read by each field's type, dates in the time zone you name, and each
  record keeps its Bubble unique id (exported from a view showing every field, or recovered from its creation time),
  so links between tables survive. Links to users, exported as emails, become the users' ids. With JSON and CSV
  exports of one type in the folder, the newest is used.
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
- `examples/editor-requests/data-types-entpawjzehwq0tbk.json` is a newer capture of the same request, with a privacy
  rule on every type, so the import report now lists the rules of all three types.
- `docs/FINDINGS.md` describes where privacy rules live and how they map onto NodeGX, and what a production app's
  `static.js` holds for its plugins.

### Fixed

- *Align to parent* reads Bubble's grid cell horizontal first, then vertical (`ba` is top centre). The converter
  had the two the wrong way round. The order comes from bubble_ex.
- `bubble-run-bundle-to-export.mjs` creates its output folder when it's missing.

## 2023-04-07 to 2023-04-13: the study

Seven exports of a test app, `v0` to `v6`, each one small change apart, with notes on where each change shows in the
JSON. [archive/2023-study/README.md](archive/2023-study/README.md) lists them.
