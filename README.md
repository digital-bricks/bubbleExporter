# Bubble Exporter

Bubble Exporter turns a Bubble app into a [NodeGX](https://github.com/The-Low-Code-Foundation/NodeGX) project. The
project is a folder of plain files. You can open it in the NodeGX editor, change it, and deploy it wherever you like.

You don't need Bubble's paid export. The converter can read the files Bubble already sends to the browser. Each
project it writes has a report listing what it couldn't convert.

## Try it

You need Node.js 18 or later. Nothing else to install.

```sh
git clone https://github.com/digital-bricks/bubbleExporter.git
cd bubbleExporter

# A small test app, from Bubble's paid export
node converter/bubble2nodegx.mjs examples/paid-export/test-app-v6.json out/test-app

# Backend workflows, option sets and data types, as the Bubble editor loads them
mkdir -p in/editor && cp examples/editor-requests/*.json in/editor/
node converter/bubble-run-bundle-to-export.mjs in/editor out/editor.export.json
node converter/bubble2nodegx.mjs out/editor.export.json out/editor

# Sample records from Bubble's Data tab, as files the NodeGX backend imports
node converter/bubble-data-to-nodegx.mjs out/editor.export.json examples/data-export out/editor --tz Europe/Paris
```

Open `out/test-app` or `out/editor` in the NodeGX editor. Each one has `docs/IMPORT-REPORT.md`, which lists what
still needs a person. Running the converter again replaces its output folder.

## Convert your own app

1. Save each page's `dynamic.js` file into one folder.
2. If your app has backend workflows, save one request from the Bubble editor into the same folder.
3. Run the first two scripts on that folder.
4. To bring your data, export each table from Bubble's Data tab and run the third script.

[docs/GETTING-YOUR-APP.md](docs/GETTING-YOUR-APP.md) shows each step. Never commit the files you download. Bubble
sends some API keys and plugin secrets to the browser with them.

## What converts

| Bubble | NodeGX |
|---|---|
| pages, elements, the responsive layout | page components with Groups, Text, Buttons, Inputs, Images … laid out in rows and columns |
| styles, colour and font tokens | style variants in `nodegx.styles.json`, Bubble's own token names as design tokens |
| front-end workflows and expressions | node chains; each expression a JavaScript Expression node |
| data types | collections with typed columns, links to other types, and default values; Bubble's User is NodeGX's built-in `_User` |
| option sets | a component each, its options as Static Data rows with every attribute |
| reusable elements, custom states, searches | components, Variables, query nodes |
| backend workflows | cloud functions; database triggers and recurring events become backend triggers, proposed in `backend/triggers.bubble.json` |

[docs/FINDINGS.md](docs/FINDINGS.md) has the full mapping. It also says what was measured and what doesn't convert yet.

## NodeGX documentation

- [Coming from Bubble](https://the-low-code-foundation.github.io/NodeGX/docs/coming-from-bubble/): every Bubble
  operator, and what it is in NodeGX, in Bubble's vocabulary.
- [Bubble to NodeGX dictionary](https://the-low-code-foundation.github.io/NodeGX/docs/bubble-dictionary/): a real
  Bubble page and the NodeGX project it becomes, side by side, element by element. *(Publishing soon.)*
- [How export works](https://the-low-code-foundation.github.io/NodeGX/docs/how-export-works/): how a NodeGX
  project becomes a React app you own, node by node. *(Publishing soon.)*

## What's in this repo

| folder | what it holds |
|---|---|
| `converter/` | the three scripts |
| `docs/` | how to get your app's files, and the findings |
| `examples/` | a paid export, the Bubble editor requests and the Data tab exports the commands above use |
| `archive/2023-study/` | the 2023 study the converter grew out of |

[CHANGELOG.md](CHANGELOG.md) lists what changed and when.

## Contributing

The converter is one table of Bubble shapes and their NodeGX equivalents. Each new Bubble feature is one more row, and
then every app that uses it converts. The most useful contribution is an example: a small Bubble app or backend
workflow using a feature the report lists as not converted, saved as described above (from a test app, never one
with real keys or data), in an issue or a pull request under `examples/`.

## Credits

Two parts of the converter come from Rico Trevisan's [bubble_ex](https://github.com/ricotrevisan/bubble_ex) (MIT
License, Copyright © 2026 Rico Trevisan). One is how *Align to parent* places an element on its 3×3 grid. The other
is 22 of the expression operators.

## Licence

Bubble Exporter is released under [GPL-3.0](LICENSE), the same licence as NodeGX. Copyright © 2023–2026 Richard Osborne.

Bubble is a trademark of Bubble Group, Inc. This project is not affiliated with or endorsed by Bubble.
