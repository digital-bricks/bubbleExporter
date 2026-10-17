# The 2023 study

In 2023 Bubble changed its pricing. Many developers talked about leaving. I thought the answer wasn't to give up
on Bubble's editor, which is a fast way to build front ends, but to stop the lock-in. That meant reading the JSON that
describes a Bubble app and translating it into something you own.

This folder is that first study, kept as it was. Each version is one small change to a test app, with its JSON
export and notes on what the change added. The converter in `converter/` grew out of it.

| version | the change |
|---|---|
| `v0` | a new Bubble app: a blank index page, the default reset_pw and 404 pages, a login popup |
| `v1` | a workflow on reset_pw: reset the password, then go to the index page |
| `v2` | an input and two buttons on index, a column layout, a `Message` data type with a `text` field, and a button that creates a Message |
| `v3` | a condition that hides a button while the input is empty |
| `v4` | a longer condition: a signed-in user, and the input or a URL parameter containing a value |
| `v5` | the API Connector plugin with one GET call |
| `v6` | the call changed to return a list, shown in a repeating group |

Each folder has a `changelog.md` for its change. From `v2` on, `analysis.md` explains where the change appears in the
JSON. `bubble-elements/` holds two workflows taken from the exports early on. The `v6` export is the converter's
first test, so it lives at `examples/paid-export/test-app-v6.json`.

Bubble's own engineering blog explains how apps are stored as trees and sent to the browser in pieces. That's what
made it possible to read an app without the paid export:

- [Trees in the clouds](https://bubble.io/blog/trees-in-the-clouds/amp/) (Josh Haas, 2018)
- [Part 2](https://bubble.io/blog/trees-in-the-clouds-part-ii/) ·
  [Part 3](https://bubble.io/blog/using-simple-indexes-to-optimize-complicated-sorts-in-postgres/) ·
  [Part 4](https://bubble.io/blog/look-ma-no-master-decentralized-integration/)

The view-only Bubble app used for the exports:
[test-bubble-export](https://bubble.io/page?name=index&id=test-bubble-export&tab=tabs-1).
