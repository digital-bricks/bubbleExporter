# Findings: a Bubble app, read and rebuilt in NodeGX

What we learned building the converter (October 2026), what it converts, what was measured, and what is still open.
Written for developers who know Bubble, NodeGX, or both.

## 1. Where a Bubble app lives

A Bubble app is a tree, as Bubble's own [Trees in the clouds](https://bubble.io/blog/trees-in-the-clouds/amp/) posts
describe. Every element, style, workflow, action and expression is a node with a `type` (or, inside an expression, a
`Message` with a `name`), and its settings in `properties`. There are three places to read that tree.

| source | what it holds | who can get it |
|---|---|---|
| **The paid JSON export** (Settings → General → Export application) | the whole app, with long key names (`properties`, `type`, `elements`) | paid plans only |
| **A page's run-mode bundle**: `/package/dynamic_js/…/<page>/dynamic.js` | `const app = JSON.parse('…')` with settings, data types, option sets, styles and the reusable elements, then `app['%p3']['<page>'] = …` with that page's whole element tree and workflows | anyone who can open the page. One file per page gives the whole front end. |
| **The Bubble editor's `c5r6j` request**: `https://bubble.io/appeditor/load_single_path/<app>/<version>/<hash>/c5r6j` | `{ last_change, data }`: every backend workflow | whoever can open the app in the Bubble editor |
| **The Bubble editor's `dxr78ubfdtfq6tbmec` request** (the same URL ending in `/dxr78ubfdtfq6tbmec`) | `{ last_change, data }`: every option set, its attributes with their types, and each option's attribute values | whoever can open the app in the Bubble editor |
| **The Bubble editor's `entpawjzehwq0tbk` request** | `{ last_change, data }`: every data type and field, deleted ones included. The bundles carry the same types, fields and defaults, so this one is optional | whoever can open the app in the Bubble editor |

The bundles and the editor's answers use abbreviated keys (`%p` properties, `%x` type, `%el` elements, `%wf`
workflows, `%ed` reusables, `%p3` pages, `%n` next, `%a` args, `%e` entries …). It is the same tree as the paid
export with short names, which is why the 2023 export's own index already wrote paths like `%p3.AAX.%el.bTGlI`.
`bubble-run-bundle-to-export.mjs` expands about 90 of them back to the export's names, keeps any it does not know,
and lists them. Nothing in a bundle is executed: the JavaScript string literals are decoded as text and parsed as
JSON.

**Backend workflows are never in the run-mode bundles.** We refetched a test app's bundles before and after adding
five backend workflows to it, and the files were byte-identical. That is why the editor request is needed. A page's
`static.js` is a different file: it carries the runtime's app-level part (every plugin's definition and code, a cache
of element properties, and tables of the pages, reusables, data types and backend workflow names), but no element
tree.

> **Security note for Bubble developers.** Because a page sends its app definition to every visitor, whatever
> Bubble puts in those bundles is public. One production app's `static.js` held a payment provider's test secret, two
> Google API keys, two webhook secrets and 13 plugin values marked private. Check your own app's bundles.

## 2. What converts, and into what

The converter is a table of Bubble shapes and their NodeGX equivalents. Anything not in the table becomes a labelled
placeholder that keeps the page or the workflow whole, plus one line in `docs/IMPORT-REPORT.md` saying what it is and
what the NodeGX way would be.

### Pages, elements and layout

| Bubble | NodeGX |
|---|---|
| a page | `/Pages/<name>`: a `Page` node (title, URL path; `index` is the home page) over a root `Group`, listed in the app's `Router` |
| Group, Shape, Popup, Floating Group, Group Focus, Alert | `Group` (a Popup starts hidden) |
| Text | `Text`; a Text with a background or a border becomes a `Group` holding the `Text` (a NodeGX Text has no box) |
| Button, Input, Multiline Input, Checkbox, Dropdown, Radio Buttons | the matching NodeGX controls (an input's content format becomes its `type`) |
| Image, Icon | `Image` (`src`, protocol-relative URLs given `https:`), a Material icon in a clickable `Group` |
| Repeating Group | a `Group` holding a `For Each` over a row component; the row's `Component Inputs` get one port per field the cells read |
| HTML, Video, Map, Slider, Date, File and Picture inputs, plugin elements | a labelled placeholder (no NodeGX element yet) |
| the responsive engine: row/column, gaps, alignment, fixed/fit/min/max sizes, *stretch* | flex direction, gaps, `alignItems`/`justifyContent`, width/height and size mode, `minWidth`/`maxWidth`, width 100% |
| "not fixed width" (width 0 in the file) | width 100% between its min and max |
| *Align to parent* containers | the biggest child stays in the flow and gives the container its height; the others are placed over it on the 3×3 grid |
| the old absolute layout | children placed by left/top inside a relative parent: renders right, edits badly |
| a hidden element | `mounted: false` (Bubble collapses a hidden element; NodeGX's `visible: false` keeps its space) |
| styles | variants in `nodegx.styles.json`, worn by the elements; hover / focus / pressed states become variant states |
| colour and font tokens | design tokens with Bubble's own names (and `_rgb` triples), so Bubble's `rgba(var(--color_x_rgb), 0.8)` works unchanged |
| Google fonts and Material Icons | one `<link>` in the project's head code |
| any other conditional property | one Expression per property: `(condition) ? state value : base value` |

### Front-end workflows and expressions

| Bubble | NodeGX |
|---|---|
| an expression (the `Message` chain) | one JavaScript `Expression` node; each thing it reads (an element's value, the current user, a URL parameter, the page width, an API call, the parent group's thing, a workflow parameter) is a wired input; operators come from a table of about 100 |
| an event: button or element clicked, page loaded, input changed, custom event | the element's `onClick` / the page's `didMount` / `onTextChanged` / an `Event Receiver` |
| *Do when condition is true* | Expression → `Value Changed` → `Condition`, so it fires on the change to true and not on every evaluation (wired straight, an action that changes what the condition reads re-fires it forever) |
| the action chain | one node per step, each step's `done` firing the next; a step's *Only when* is a `Condition` in between; a step marked *Disable this step* is skipped |
| create / change / delete a thing | `Create Record` / `Set Record Properties` / `Delete Record`, each field a `prop-<field>` input |
| go to page, log in / sign up / log out, set state, show / hide, trigger a custom event, open URL | `Navigate`, the user nodes, `Set Variable`, a visibility variable, `Send Event`, `External Link` |
| *Do a search for* | a query node with the constraints as its filter and the sort |
| an option set | a component `/Option sets/<name>`: one `Static Data` node, out as `items` and `count`. Each option is a row `{ value, display, <attribute>: … }` in Bubble's sort order. `value` is the option's *database value*, because that is what a field stores and what an expression names (in one production app, 131 of 291 references named a database value that was not the option's key). Dates become ISO strings, Bubble's CDN links `https:` URLs, lists arrays; deleted sets, options and attributes are skipped. The attributes and their types are kept in the component's metadata |
| one option in an expression | that option's row, so *option's attribute* reads the attribute |
| reusable elements, custom states | components placed as instances, `Variable`s |
| *Schedule API workflow* on a page | a call to the backend workflow's cloud function (now: a delay is not converted) |
| data types | collections in the project. Text, number, yes/no and date fields are String, Number, Boolean and Date; images and files a String holding the URL; a geographic address, number range or date range an Object; a date interval a Number; an option set field a String holding the option's database value; a link to a thing (or a User) a Pointer to that collection; a list of anything an Array. Default values carry over (dates are milliseconds since 1970). Deleted types and fields are skipped. Bubble's User is NodeGX's built-in `_User` |
| the API Connector | one `HTTP` node per call a page uses, fetched when the page loads; field paths from the call's parsed types |

### Backend workflows

| Bubble | NodeGX |
|---|---|
| API workflow (name, parameters with their types, *optional*, *can run without authentication*, *expose as a public API*) | a cloud function `/#__cloud__/<name>`: a `Request` declaring each parameter, the steps, and a `Response`. Bubble's `/api/1.1/wf/<name>` becomes `POST /functions/<name>` with the parameters in the JSON body |
| *Only when* on a backend workflow, with *return 200 if condition not met* | a `Condition` after the request; its false branch still answers |
| database trigger | a cloud function given the changed `record` (and `action`, `collection`, `id`), plus a **db-change trigger** on that collection for create, update and delete |
| recurring event | a cloud function given a `thing`, plus a **schedule trigger, written disabled** (see §4) |
| backend custom event (parameters, return values) | a shared cloud component: inputs `run` plus each parameter, outputs `done` plus each return value; *Trigger a custom event* places it |
| *This thing* in a trigger, a workflow parameter | the request's `record` / `thing`, the request's or the component's parameter |
| sign up, create an account for someone else | `Create User` (username = email, the extra fields as properties); an existing account is a failure unless *return the user if it already exists* is ticked |
| make changes to the current user, update credentials, change the email for another user | `Update User` |
| send email, send password reset email, send confirmation email | `Send Email` (to, subject, body), or its password-reset / verify-email template |
| return data from API, terminate this workflow | a `Response` with each returned key, a `Response` |
| a step that fails | answers with an error, as Bubble stops the workflow there (otherwise the caller would wait) |

Triggers belong to a NodeGX backend, not to the project, so the converter writes them to
`backend/triggers.bubble.json`, ready to create once a backend is bound, together with a proposed call rule for each
function.

## 3. What was measured

Every result below was validated by NodeGX's own project validator.

| app | what converted | validation |
|---|---|---|
| `v6/v6.json` in this repo (2023 test app: 3 pages, 22 elements, 40 styles, 2 workflows, an API call, a repeating group, 2 data types) | 22 of 22 elements, 3 of 3 actions, 32 of 40 styles (8 are for elements NodeGX does not have), 11 expressions with no unknown operator | 0 errors |
| a one-page landing template (header, hero, stats, benefits, pricing, call to action, footer: 188 elements, 14 workflows) | 188 of 188 elements, 21 of 21 actions; the NodeGX render matches Bubble's section by section, apart from the hero's column widths (see §4) | 0 errors, 0 console errors |
| a six-year production app (22 pages, Bubble version 28) | 3,803 of 3,941 elements (96%; the rest are plugin elements), 637 workflows, 1,040 of 1,285 actions (81%; the rest are plugin actions, server-side email and scheduled workflows), 4,871 expressions, 235 searches, 45 option sets, 33 reusables, 40 data types | 0 errors on 11,556 nodes; the project opens with its workflows, data and styles intact, but does not run well yet (see §4) |
| `examples/backend-workflows/` (every backend workflow kind, every built-in backend action, every field filled) | 4 of 4 workflows to cloud functions, 2 triggers proposed, 15 of 31 actions to real nodes; the other 16 are placeholders with a finding each | 0 errors |

## 4. What does not convert yet, and the known problems

Each of these is a known shape: a table row still to write, a NodeGX node still to build, or a decision for a person.

- **Plugins.** Plugin elements and actions have no NodeGX counterpart. Their code is in `static.js`; each one is a
  port to write by hand, or with an AI, against the plugin's source.
- **Privacy rules** are reported, not converted. They use the same expression language, so they will become a table
  row into NodeGX's `nodegx.security.json`.
- **"Thing before change"** in a database trigger has no NodeGX counterpart: a NodeGX db-change trigger hands its
  function the record after the write only. It is read as empty, with a finding. Most database triggers compare
  before and after, so this matters.
- **Recurring events.** Bubble sets the frequency per thing, where *Schedule a recurring event* runs; a NodeGX
  schedule runs a function on one cron, with no thing. The trigger is written disabled at midnight daily, for a
  person to choose.
- **A function run by a trigger accepts calls with no sign-in**, because the trigger sends none, so it is also a
  public endpoint until its call rule is `nobody`. The proposed rules in `triggers.bubble.json` say so; that a
  trigger still runs it under that rule has not been tested yet.
- **Backend actions with no node yet**: log in / log out in a backend workflow (a backend has no browser session),
  log out other sessions, check a password, temporary passwords, magic links, calendar (ICS) emails, actions on
  lists of things, slugs, CSV upload, deleting an uploaded file, and scheduling a workflow from a workflow (a
  NodeGX backend workflow definition with a wait step is the likely home). *Send email*'s cc, bcc, reply-to, sender
  name and attachments have no port yet.
- **The parameters *Schedule API workflow* sends** have not been seen yet: the example schedules one with none.
- **Delays.** *Schedule API workflow* at a later date is called at once, with a finding.
- **Column widths in a row.** When two "not fixed width" columns share a row, Bubble gives them different shares
  and the rule is not known yet; NodeGX gives them equal shares.
- **Links to a URL** become a Text with no destination (an External Link is the row to write), and a Shape's
  ellipse or triangle type is not read.
- **Large apps.** The production app above opens, but at run time its pages throw errors
  continuously: queries with no backend to answer, sizes sent as strings, the placeholder `__bubble(…)` for unknown
  operators (not defined at run time), show/hide wired to a component instance that has no such input. Each is
  measured and is converter work; together they are why the next step is small templates, one feature at a time.
- **Data.** Rows are not imported yet; the collections are declared, ready for a CSV importer.
- **Ranges and date intervals.** A number range or date range field is declared as an Object and a date interval as
  a Number, but no example holds a value yet, so their stored shape and unit are not known. Dates are milliseconds
  since 1970 (a field's default of 1 January 1970, midnight in Paris, is stored as `-3600000`).
- **Created By.** Bubble fills it on every new thing; NodeGX does not, so reads of it are empty.

## 5. Why most of a Bubble app can be converted by a program

Every Bubble app is built from the same finite set of shapes: a few dozen element types, under a hundred action
types, a few hundred expression operators. Each is one table row, written once, and then every app that uses it
converts with no AI in the loop. That is why the test app converted completely and the production app reached 96% of
its elements: the table covers what they use. The work is the table, not the apps.

The rest is judgement, and that is where a person or an AI earns its place: plugins, re-flowing the old absolute
layout into rows and columns, naming (Bubble apps are full of *Group D*), and the security rules.
