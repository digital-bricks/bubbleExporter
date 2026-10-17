# Bubble Exporter

Turn a Bubble app into a [NodeGX](https://github.com/The-Low-Code-Foundation/NodeGX) project you own: pages,
elements, styles, workflows, data types and backend workflows, as plain files you can open, edit, run and deploy
anywhere.

Two small Node.js scripts with no dependencies do the work:

- **`converter/bubble-run-bundle-to-export.mjs`** gets an app's definition without Bubble's paid export. It reads the
  files a Bubble page already sends to every visitor, plus one request from the Bubble editor for the backend
  workflows.
- **`converter/bubble2nodegx.mjs`** turns that definition (or a paid `.bubble` export) into a NodeGX project folder,
  and writes a report of everything it could not convert.

It is early work, and honest about it: every conversion writes `docs/IMPORT-REPORT.md` into the project, listing each
thing that still needs a person. [docs/FINDINGS.md](docs/FINDINGS.md) says what converts today, what was measured
and what does not convert yet.

## Quick start

You need Node.js 18 or later. Nothing to install.

```sh
git clone https://github.com/digital-bricks/bubbleExporter.git
cd bubbleExporter

# 1. A paid Bubble export (this repo's own 2023 test app)
node converter/bubble2nodegx.mjs v6/v6.json out/v6
cat out/v6/docs/IMPORT-REPORT.md

# 2. Backend workflows alone (from the examples in this repo)
mkdir -p in/backend && cp examples/backend-workflows/example-c5r6j-filled.json in/backend/
node converter/bubble-run-bundle-to-export.mjs in/backend out/backend.export.json
node converter/bubble2nodegx.mjs out/backend.export.json out/backend

# 3. Option sets alone (three sets, one with an attribute of every type)
mkdir -p in/options && cp examples/option-sets/example-dxr78ubfdtfq6tbmec.json in/options/
node converter/bubble-run-bundle-to-export.mjs in/options out/options.export.json
node converter/bubble2nodegx.mjs out/options.export.json out/options
```

Then open the output folder in the NodeGX editor. The converter replaces the output folder each time it runs.

## Converting your own app

You need your app's pages and, if it has any, its backend workflows. None of it needs a paid plan.

**1. The pages.** Each page of a Bubble app loads a file called `dynamic.js` that holds the whole app definition
(settings, data types, option sets, styles, reusable elements) plus that page's elements and workflows. Fetch one per
page:

```sh
mkdir -p in/myapp && cd in/myapp
for p in index about pricing; do            # your page names
  curl -sL -A "Mozilla/5.0 Chrome/130.0" -o "$p.html" "https://<your-app>.bubbleapps.io/version-test/$p"
  d=$(grep -o '/package/dynamic_js/[^"]*dynamic.js' "$p.html" | head -1)
  curl -sL -A "Mozilla/5.0 Chrome/130.0" -o "$p.dynamic.js" "https://<your-app>.bubbleapps.io$d"
done
cd ../..
```

A page behind a login serves the index page instead. For those, sign in to your app in the browser, open DevTools →
Network, reload the page, find the request ending in `dynamic.js` and save its response into the same folder.

**2. The backend workflows.** These are never sent to the browser of someone using your app. Only the Bubble editor
loads them. Open your app in the Bubble editor with DevTools → Network open, filter on `c5r6j`, and save the response
of the request ending in `/c5r6j` (it looks like
`https://bubble.io/appeditor/load_single_path/<app>/<version>/<hash>/c5r6j`) into the same folder as any file whose
name contains `c5r6j` and ends in `.json`.

**3. The option sets (optional).** The page bundles carry them already, but the Bubble editor's copy is the one you
are editing, with every attribute and its type. In the same Network tab, filter on `dxr78ubfdtfq6tbmec` and save the
response of the request ending in `/dxr78ubfdtfq6tbmec` into the folder, as any file whose name contains
`dxr78ubfdtfq6tbmec` and ends in `.json`. A set in it replaces the bundle's set with the same key. The data types
work the same way with `entpawjzehwq0tbk`, though the bundles already carry every type, field and default; the
editor's copy adds only the types you deleted, which are skipped anyway.

**4. Convert.**

```sh
node converter/bubble-run-bundle-to-export.mjs in/myapp out/myapp.export.json
node converter/bubble2nodegx.mjs out/myapp.export.json out/myapp
```

> **Never commit or share the bundles.** A Bubble app's `static.js`, and sometimes its `dynamic.js`, can carry API
> keys and plugin secrets, because Bubble sends them to the browser. One app we converted had a payment provider's
> test secret, two Google keys and two webhook secrets in its `static.js`. This repo's `.gitignore` ignores them. Use these
> scripts on apps you own.

## What you get

A NodeGX project folder:

| Bubble | NodeGX |
|---|---|
| pages, elements, the responsive layout | page components with Groups, Text, Buttons, Inputs, Images … laid out in rows and columns |
| styles, colour and font tokens | style variants in `nodegx.styles.json`, Bubble's own token names as design tokens |
| front-end workflows and expressions | node chains; each expression a JavaScript Expression node |
| data types | collections with typed columns, links to other types, and default values; Bubble's User is NodeGX's built-in `_User` |
| option sets | a component each, its options as Static Data rows with every attribute |
| reusable elements, custom states, searches | components, Variables, query nodes |
| backend workflows | cloud functions; database triggers and recurring events become backend triggers, proposed in `backend/triggers.bubble.json` |

The full mapping, with what each one is in NodeGX, is in [docs/FINDINGS.md](docs/FINDINGS.md).

## NodeGX documentation

- [Coming from Bubble](https://the-low-code-foundation.github.io/NodeGX/docs/coming-from-bubble/): every Bubble
  operator, and what it is in NodeGX, in Bubble's vocabulary.
- [Bubble to NodeGX dictionary](https://the-low-code-foundation.github.io/NodeGX/docs/bubble-dictionary/): a real
  Bubble page and the NodeGX project it becomes, side by side, element by element. *(Publishing soon.)*
- [How export works](https://the-low-code-foundation.github.io/NodeGX/docs/how-export-works/): how a NodeGX
  project becomes a React app you own, node by node. *(Publishing soon.)*

## Where this started (2023)

In 2023 Bubble changed its pricing, and many developers talked about leaving. I thought the answer was not to give up
on Bubble's editor, which is a fast way to build front ends, but to stop the lock-in: read the JSON that describes a
Bubble app and translate it into something you own.

The `v0` … `v6` folders are that first study. Each one is one small change to a test app and its JSON export, with
notes on what the change added. V0 is a new Bubble app; V1 adds a workflow action; V2 adds visual elements and a
database write, and so on. The converter grew out of them, and `v6/v6.json` is still its first test.

Bubble's own engineering blog explains how apps are stored as trees and sent to the browser in pieces, which is what
made the run-mode route possible:

- [Trees in the clouds](https://bubble.io/blog/trees-in-the-clouds/amp/) (Josh Haas, 2018)
- [Part 2](https://bubble.io/blog/trees-in-the-clouds-part-ii/) ·
  [Part 3](https://bubble.io/blog/using-simple-indexes-to-optimize-complicated-sorts-in-postgres/) ·
  [Part 4](https://bubble.io/blog/look-ma-no-master-decentralized-integration/)

The view-only Bubble app used for the 2023 exports:
[test-bubble-export](https://bubble.io/page?name=index&id=test-bubble-export&tab=tabs-1).

## Contributing

The converter is one table of Bubble shapes and their NodeGX equivalents. Each new Bubble feature is one more row, and
then every app that uses it converts. The most useful contribution is an example: a small Bubble app or backend
workflow using a feature the report lists as not converted, saved as described above (from a test app, never one
with real keys or data), in an issue or a pull request under `examples/`.

## License

[GPL-3.0](LICENSE), the same license as NodeGX. Copyright © 2023–2026 Richard Osborne.

Bubble is a trademark of Bubble Group, Inc. This project is not affiliated with or endorsed by Bubble.
