#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2023-2026 Richard Osborne. Part of bubbleExporter: https://github.com/digital-bricks/bubbleExporter
// bubble-data-to-nodegx — a Bubble app's data (the Data tab's exports) → files the NodeGX backend imports.
//
//   node bubble-data-to-nodegx.mjs <export.json> <folder of Bubble data exports> <NodeGX project dir> [--tz Europe/Paris]
//
// <export.json> is the app definition bubble2nodegx.mjs read (it names each type's fields and their types). The
// folder holds Bubble's exports, one per data type, as Bubble names them (`export_All-<Type>s_<date>.json` or `.csv`).
// For each one this writes `<project>/backend/data/<collection>.json` in the backend's own collection format, and
// `backend/data/IMPORT-DATA.md` with the commands that load them and every value it could not read.
// Bubble writes dates as text in the exporting browser's time zone, to the minute: `--tz` names that zone (default:
// this machine's). No dependencies.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2); const tzAt = args.indexOf('--tz'); const tz = tzAt >= 0 ? args.splice(tzAt, 2)[1] : Intl.DateTimeFormat().resolvedOptions().timeZone;
const [srcPath, dataDir, projectDir] = args;
if (!srcPath || !dataDir || !projectDir) { console.error('usage: bubble-data-to-nodegx.mjs <export.json> <data folder> <project dir> [--tz <IANA zone>]'); process.exit(2); }
const app = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
const userTypes = app.user_types || {}; const optionSets = app.option_sets || {};
const live = (o) => Object.entries(o || {}).filter(([, x]) => x && typeof x === 'object' && !x.deleted);
const typeName = (k) => k === 'user' ? '_User' : userTypes[k]?.display || k; // as bubble2nodegx.mjs names the collection
const findings = []; const note = (where, what) => findings.push({ where, what });

// ---------------------------------------------------------------- reading Bubble's exported text
const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
// the offset of `zone` at a UTC instant, in ms (Intl, no dependencies)
function zoneOffset(ms, zone) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - ms;
}
// "Oct 17, 2026 3:05 pm" (the zone's wall clock) → ISO
function bubbleDate(s) {
  if (/^\d{4}-\d{2}-\d{2}T/.test(String(s))) { const d = new Date(s); return Number.isNaN(d.getTime()) ? undefined : d.toISOString(); } // the Data API's ISO dates (a paid plan's)
  const m = /^([A-Za-z]{3})[a-z]* (\d{1,2}), (\d{4})(?:,? (\d{1,2}):(\d{2})(?::(\d{2}))? ?([ap]m)?)?$/i.exec(String(s).trim());
  if (!m || MONTHS[m[1].toLowerCase()] === undefined) return undefined;
  let h = +(m[4] || 0); const ap = (m[7] || '').toLowerCase(); if (ap === 'pm' && h < 12) h += 12; if (ap === 'am' && h === 12) h = 0;
  const wall = Date.UTC(+m[3], MONTHS[m[1].toLowerCase()], +m[2], h, +(m[5] || 0), +(m[6] || 0));
  let utc = wall - zoneOffset(wall, tz); utc = wall - zoneOffset(utc, tz); // twice, for the hour a clock change moves
  return new Date(utc).toISOString();
}
const UNIT_MS = { second: 1e3, minute: 6e4, hour: 36e5, day: 864e5, week: 6048e5 };
// "0 seconds", "2 days 3 hours" → ms
function bubbleInterval(s) { let ms = 0, any = false; for (const m of String(s).matchAll(/(-?[\d.]+)\s*(second|minute|hour|day|week)s?/gi)) { ms += +m[1] * UNIT_MS[m[2].toLowerCase()]; any = true; } return any ? ms : undefined; }
const list = (s) => Array.isArray(s) ? s : String(s).split(/\s*,\s*/).filter(Boolean); // Bubble joins a list with ", "
const BUBBLE_ID = /^\d{13}x\d{15,}$/; // a thing's unique id: "1792241441972x125425336514852770"

// one exported value of a field of Bubble type `t` → the value the column holds, or { error }
function value(t, raw, field) {
  if (raw === '' || raw === null || raw === undefined) return null;
  if (t.startsWith('list.')) { const inner = t.slice(5); const xs = list(raw).map((x) => value(inner, x, field)); const bad = xs.find((x) => x && x.error); return bad || xs.filter((x) => x !== null); }
  if (t === 'user' || t.startsWith('custom.')) return BUBBLE_ID.test(String(raw)) ? String(raw) : { error: `"${raw}" is not a unique id, so the link cannot be kept` };
  if (t.startsWith('option.')) { const set = optionSets[t.slice(7)]; const hit = live(set?.values).find(([k, o]) => o.display === raw || o.db_value === raw || k === raw); return hit ? hit[1].db_value ?? hit[0] : { error: `"${raw}" is not an option of ${set?.display || t.slice(7)}` }; }
  switch (t) {
    case 'text': return String(raw);
    case 'number': { const n = Number(String(raw).replace(/,/g, '')); return Number.isNaN(n) ? { error: `"${raw}" is not a number` } : n; }
    case 'boolean': { const s = String(raw).toLowerCase(); return s === 'yes' || s === 'true' ? true : s === 'no' || s === 'false' ? false : { error: `"${raw}" is not yes or no` }; }
    case 'date': { const d = bubbleDate(raw); return d ?? { error: `"${raw}" is not a date Bubble writes` }; }
    case 'image': case 'file': return String(raw).startsWith('//') ? `https:${raw}` : String(raw);
    case 'dateinterval': { const ms = bubbleInterval(raw); return ms ?? { error: `"${raw}" is not an interval` }; }
    case 'date_range': case 'number_range': {
      let pair; try { pair = JSON.parse(raw); } catch { return { error: `"${raw}" is not a range` }; }
      if (!Array.isArray(pair) || pair.every((x) => x === '' || x == null)) return null;
      const one = (x) => x === '' || x == null ? null : t === 'date_range' ? bubbleDate(x) ?? x : Number(x);
      return { start: one(pair[0]), end: one(pair[1]) };
    }
    case 'geographic_address': return typeof raw === 'object' ? raw : { address: String(raw) };
    default: return String(raw);
  }
}

// ---------------------------------------------------------------- the files
function readRows(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.json')) { const j = JSON.parse(text); return Array.isArray(j) ? j : j?.response?.results ?? j?.results ?? []; } // the Data tab's array, or a Data API page
  const rows = []; let row = [], f = '', q = false; // RFC 4180
  for (let i = 0; i < text.length; i++) { const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(f); f = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); f = ''; rows.push(row); row = []; } else f += c; }
  if (f || row.length) { row.push(f); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((x) => x !== ''));
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.replace(/^﻿/, ''), r[i] ?? ''])));
}
// "export_All-someOtherDataTypes_2026-10-17_13-22-17.json" → the type whose name (or its plural) is in it
function typeOf(file) {
  const m = /^export_All-(.+?)_\d{4}-\d{2}-\d{2}/.exec(path.basename(file)); const n = (m ? m[1] : path.basename(file, path.extname(file))).toLowerCase();
  return live(userTypes).find(([k, t]) => { const d = String(t.display || k).toLowerCase(); return [d, `${d}s`, `${d}es`, d.replace(/y$/, 'ies')].includes(n); })?.[0];
}

const outDir = path.join(projectDir, 'backend', 'data'); fs.mkdirSync(outDir, { recursive: true });
// one file per type: the newest export (Bubble stamps the name with its time), JSON or CSV
const stamp = (f) => (/_(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})/.exec(f) || [, f])[1];
const newest = new Map();
for (const f of fs.readdirSync(dataDir).filter((f) => /\.(json|csv)$/i.test(f)).sort((a, b) => stamp(a).localeCompare(stamp(b)))) {
  const key = typeOf(f); if (!key) { note(f, 'no data type of the app matches this file name; skipped'); continue; }
  if (newest.has(key)) note(newest.get(key), `an older export of the same type than ${f}; skipped`); newest.set(key, f);
}
const files = [...newest.values()];
if (!files.length) { console.error(`no .json or .csv exports in ${dataDir}`); process.exit(2); }
const written = []; let withoutIds = 0;
for (const f of files) {
  const key = typeOf(f);
  const t = userTypes[key]; const coll = typeName(key);
  const fields = Object.fromEntries(live(t.fields).filter(([fk, fd]) => !/^(unique[ _]?id|_id|bubble[ _]?id)$/i.test(fd.display || fk)).map(([fk, fd]) => [fd.display || fk, { key: fk, type: typeof fd.value === 'string' ? fd.value : 'text' }]));
  const rows = readRows(path.join(dataDir, f)); const records = []; const extra = new Set(); let noId = 0;
  rows.forEach((row, i) => {
    const rec = {};
    for (const [k, raw] of Object.entries(row)) {
      const lk = k.toLowerCase();
      if (/^(unique[ _]?id|_id|bubble[ _]?id)$/i.test(k)) { if (raw) rec.objectId = String(raw); continue; } // Bubble's unique id: the Data API's `_id`, or a text field filled with "This thing's unique id" (no Data tab export carries it)
      if (lk === 'creation date' || lk === 'created date') { const d = raw && bubbleDate(raw); if (d) rec.createdAt = d; continue; }
      if (lk === 'modified date') { const d = raw && bubbleDate(raw); if (d) rec.updatedAt = d; continue; }
      if (lk === 'creator' || lk === 'created by') { if (BUBBLE_ID.test(String(raw))) rec.createdBy = String(raw); continue; } // "(App admin)": made in the editor, no user
      if (lk === 'slug') { if (raw) { rec.Slug = String(raw); extra.add('Slug'); } continue; }
      if (key === 'user' && lk === 'email') { if (raw) { rec.email = String(raw); rec.username = String(raw); } continue; } // NodeGX signs in by username; the converter's sign-up sets it to the email
      const fd = fields[k]; if (!fd) { note(`${coll} row ${i + 1}`, `"${k}" is not a field of ${t.display || key} (deleted, or a built-in this does not know); left out`); continue; }
      const v = value(fd.type, raw, k);
      if (v && typeof v === 'object' && v.error) note(`${coll} row ${i + 1}`, `${k}: ${v.error}; left empty`);
      else if (v !== null) rec[k] = v;
    }
    if (!rec.objectId) noId++;
    records.push(rec);
  });
  if (noId) { withoutIds += noId; note(coll, `${noId} of ${rows.length} rows have no unique id: each gets a new one on import, so a link to them from another table points nowhere`); }
  // the columns, as bubble2nodegx.mjs declares them, so the backend types each value
  const COL = { text: 'String', number: 'Number', boolean: 'Boolean', date: 'Date', image: 'String', file: 'String', geographic_address: 'Object', number_range: 'Object', date_range: 'Object', dateinterval: 'Number' };
  const columns = Object.entries(fields).map(([name, fd]) => ({ name, ...(fd.type.startsWith('list.') ? { type: 'Array' } : fd.type === 'user' || fd.type.startsWith('custom.') ? { type: 'Pointer', targetClass: typeName(fd.type.replace(/^custom\./, '')) } : { type: COL[fd.type] || 'String' }) }));
  if (records.some((r) => r.createdBy)) columns.push({ name: 'createdBy', type: 'Pointer', targetClass: '_User' });
  for (const x of extra) columns.push({ name: x, type: 'String' });
  if (key === 'user') columns.push({ name: 'email', type: 'String' }, { name: 'username', type: 'String' });
  const out = path.join(outDir, `${coll}.json`);
  fs.writeFileSync(out, JSON.stringify({ format: 'nodegx-collection', version: 1, collection: coll, exportedAt: new Date().toISOString(), source: { bubbleType: key, file: f, timeZone: tz }, schema: { columns }, count: records.length, records }, null, 2) + '\n');
  written.push({ coll, file: path.basename(out), count: records.length, from: f });
}
if (written.some((w) => w.coll === '_User')) note('_User', 'Bubble never exports passwords: every imported user needs a password reset (or a sign-up) before they can sign in');

const report = [
  '# Data import', '',
  `From the Bubble data exports in \`${path.basename(dataDir)}\`. Dates were read as wall-clock times in **${tz}** (Bubble writes them in the exporting browser's zone, to the minute).`, '',
  '| collection | rows | from |', '|---|---|---|', ...written.map((w) => `| ${w.coll} | ${w.count} | ${w.from} |`), '',
  'Load them into a bound backend (the backend must be stopped, or use its admin import):', '', '```sh',
  ...written.map((w) => `nodegx-backend import ${w.coll} backend/data/${w.file} --format json --data-dir <the backend's data dir>`), '```', '',
  `## Findings (${findings.length})`, '', '| where | what |', '|---|---|', ...findings.map((x) => `| ${x.where} | ${x.what.replace(/\|/g, '\\|')} |`), ''].join('\n');
fs.writeFileSync(path.join(outDir, 'IMPORT-DATA.md'), report);
console.log(`${written.map((w) => `${w.coll} ${w.count}`).join(', ')} → ${path.relative(process.cwd(), outDir) || outDir}; dates read in ${tz}; findings ${findings.length}${withoutIds ? `; ${withoutIds} rows without a unique id` : ''}`);
