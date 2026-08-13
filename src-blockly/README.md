# Blockly block

Source of `admin/blockly.js`, the `email` block ioBroker.javascript's Blockly editor shows in its
`sendTo` category. **`admin/blockly.js` is generated - never edit it directly.**

```bash
npm run build:blockly   # type check + bundle into admin/blockly.js
```

`npm run build` runs it after the backend and the admin/rules bundles, so a release always ships a
bundle that matches this source. Like the other build output in this repository, the generated file
is committed.

| file | |
|---|---|
| `blockly.ts` | the block, its mutation and the generator |
| `icons.ts` | the +/- buttons of the attachment rows, as inline SVG |
| `words.ts`, `i18n/*.json` | the words |

## Take the types from `blockly`, the runtime from `window`

`blockly` is a **dev** dependency - it contributes types and nothing else:

```ts
import type { Block } from 'blockly/core';

const Blockly = window.Blockly;
```

Never `import * as Blockly from 'blockly/core'` here. The editor loads this file long after it has
created its own Blockly instance, and an import would bundle a *second*, private one. The block would
register itself on that private instance and stay invisible to the editor - with no error anywhere.

The globals the editor provides (`window.Blockly` including its ioBroker extras `Words`, `Translate`
and `Sendto`, plus `window.main` and `window.systemLang`) are declared in `iobroker-blockly.d.ts`.

## Words

`i18n/*.json` holds one file per language, keyed by word - the layout `translate-adapter` expects,
which is why `npm run translate` passes `-b src-blockly/i18n/en.json` next to the admin base file.
`words.ts` imports them and turns them inside out into `Blockly.Words` (keyed by word, then
language). A language file may be incomplete; `Blockly.Translate` falls back to English.

`email_help` is not in there. It is a link, not a word, so `words.ts` sets it directly.

They are bundled rather than fetched: the editor loads `admin/blockly.js` as a classic script and
`Blockly.Words` has to be filled before the block registers itself, so there is no point at which the
files could be loaded over the network.

## The attachment rows

The number of rows is a mutation (`<mutation filecount="N">`), driven by a **-** button per row and
a **+** button below them rather than by a mutator dialog. `updateShape_()` tears the rows down and
rebuilds them, so `saveFileConnections_()` has to detach whatever hangs on them first and hand it
back in - otherwise adding a row would drop the file names already entered.

A block saved before the rows were configurable carries no count and gets two rows; a count from the
XML is clamped to 0..20.

The `cid` of an attachment follows its **row number**, not its position in the message, so leaving a
row in the middle empty does not renumber the ones after it.

## Registering the generator

```ts
Blockly.JavaScript.forBlock.email = emailToJavaScript;
```

Blockly 10 removed the fallback that used to look generators up as `Blockly.JavaScript.<type>`. The
editor migrates that old slot to `forBlock`, but older editors did so *before* loading any adapter's
`blockly.js`, so a block registered the old way was never migrated and failed with _"generator does
not know how to generate code for block type"_.

## Empty inputs

`valueToCode` returns an empty string for an unconnected input. Emitting `text: ,` or `'…' + )` is a
syntax error that takes the user's whole script down, so those parts are left out instead.
