# Getting your app's files

The converter needs your app's definition. Bubble's paid plans export it as one JSON file (Settings → General →
Export application), and the converter reads that file directly. On any plan you can collect the same definition
from the files Bubble sends to the browser. This page shows how.

Use these steps on apps you own.

> **Never commit or share the files you download.** A Bubble app's `static.js`, and sometimes its `dynamic.js`, can
> carry API keys and plugin secrets, because Bubble sends them to the browser. One app we converted had a payment
> provider's test secret, two Google keys and two webhook secrets in its `static.js`. This repo's `.gitignore` ignores
> them.

## 1. The pages

Each page of a Bubble app loads a file called `dynamic.js`. It holds the app's settings, data types, option sets,
styles and reusable elements, plus that page's elements and workflows. Save one per page into a folder:

```sh
mkdir -p in/myapp && cd in/myapp
for p in index about pricing; do            # your page names
  curl -sL -A "Mozilla/5.0 Chrome/130.0" -o "$p.html" "https://<your-app>.bubbleapps.io/version-test/$p"
  d=$(grep -o '/package/dynamic_js/[^"]*dynamic.js' "$p.html" | head -1)
  curl -sL -A "Mozilla/5.0 Chrome/130.0" -o "$p.dynamic.js" "https://<your-app>.bubbleapps.io$d"
done
cd ../..
```

A page behind a login serves the index page instead. For those pages, sign in to your app in the browser and open
DevTools → Network. Reload the page, find the request ending in `dynamic.js` and save its response into the same
folder.

## 2. The Bubble editor's requests

Backend workflows are never sent to the people using your app. Only the Bubble editor loads them. Open your app in
the Bubble editor with DevTools → Network open. Each part below arrives in a request to
`https://bubble.io/appeditor/load_single_path/<app>/<version>/<hash>/<code>`. Filter on the code and save the
response into the same folder, under any name that contains the code and ends in `.json`.

| code | what it holds | when you need it |
|---|---|---|
| `c5r6j` | every backend workflow | whenever your app has backend workflows: the page files never carry them |
| `dxr78ubfdtfq6tbmec` | every option set, with its attributes and their types | optional: the page files carry option sets too, and a set in this file replaces the page files' copy |
| `entpawjzehwq0tbk` | every data type and field | optional: the page files carry the same types, fields and defaults; this file adds only deleted ones, which are skipped |

`examples/editor-requests/` has one of each, saved from a test app.

## 3. Convert

```sh
node converter/bubble-run-bundle-to-export.mjs in/myapp out/myapp.export.json
node converter/bubble2nodegx.mjs out/myapp.export.json out/myapp
```

The first script gathers the folder into one file shaped like Bubble's paid export. The second turns that file into
a NodeGX project at `out/myapp`, with `docs/IMPORT-REPORT.md` inside listing what still needs a person. A paid
export skips the first script:

```sh
node converter/bubble2nodegx.mjs my-app.bubble out/myapp
```

## 4. Your data

Bubble's Data tab exports the fields its current view shows, and the default view leaves out each record's unique
id. Links between tables need that id. A view that shows every field includes it:

1. In the Data tab, under App data, make a new view and call it something like "All fields".
2. Pick the data type, then press *Select all* in the list of fields.
3. Export the view as JSON or CSV into a folder of its own.
4. Repeat for each data type.

Then run:

```sh
node converter/bubble-data-to-nodegx.mjs out/myapp.export.json in/myapp-data out/myapp --tz Europe/Paris
```

Bubble writes dates as text in your browser's time zone, so `--tz` names that zone. The script works out each
file's data type from its columns, and keeps the newest export when a type has more than one. It writes one file
per collection into `out/myapp/backend/data/`. Beside them, `IMPORT-DATA.md` gives the commands that load them into
a NodeGX backend.

Each record keeps its Bubble id in NodeGX, so links between tables still point at the right record. Importing
again updates records rather than duplicating them. Bubble exports a link to a User as the user's email. The
script turns it back into that user's id. Bubble never exports passwords, so imported users need to reset theirs.

An export without the unique id still works for most links. A Bubble id begins with its record's creation time in
milliseconds (`1792241441972x…` was created at 12:50:41 UTC). So when another table links to an id and exactly one
record of that type was created in that minute, the script gives that record the id. Two records created in the
same minute can't be told apart. `IMPORT-DATA.md` lists them.
