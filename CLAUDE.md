# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`ioBroker.email` is an ioBroker adapter that **sends** emails (it cannot read them) via [nodemailer](https://github.com/nodemailer/nodemailer). It is a `daemon`-mode, message-driven adapter: it creates no data points of its own and does nothing until another adapter/script calls `sendTo('email', …)`. Requires Node.js >= 22, js-controller >= 6.0.11, admin >= 7.7.22.

## Commands

```bash
npm run npm          # install root + src-admin + src-rules dependencies
npm run build        # tsc (src -> build) + node tasks.mts (admin UI + rules UI) + Blockly
npm run tsc          # backend only: tsc -p tsconfig.build.json
npm run build:blockly      # only the Blockly block: src-blockly -> admin/blockly.js
npm run build:admin  # only the src-admin bundle (clean, npm i, vite, copy) = node tasks.mts --admin-build
npm run build:rules  # only the src-rules bundle = node tasks.mts --rules-build
npm run check        # type-check only: root + tasks.mts + src-blockly
npm run lint         # eslint (root); src-admin and src-rules have their own `npm run lint`
npm test             # test:js + test:package
npm run test:integration   # boots a real js-controller and starts the adapter (slow)
npm run translate    # @iobroker/adapter-dev translate-adapter for admin/i18n
npm run release-patch      # release-script; runs `npm run build` before committing
```

Single test: `npx mocha --config test/mocharc.custom.json --grep "<pattern>"` (or `npx mocha test/package --exit`).

Type-check without emitting: `npm run check`, or a single project with `npx tsc --noEmit -p tsconfig.json`.

The build script is `tasks.mts` — TypeScript executed directly by node (native type stripping, no `tsx`/`ts-node`), so it needs Node >= 22.18. It is type-checked through `tsconfig.tasks.json` (not emitted), and eslint lints it through that same tsconfig via an override in `eslint.config.mjs`.

## Build artifacts are committed

`build/`, `admin/custom/` and `admin/rules/` are **tracked in git** (only `src-admin/build`, `src-rules/build` and `node_modules` are ignored). Any change to `src/`, `src-admin/` or `src-rules/` must be followed by the corresponding build and the regenerated output committed alongside the sources, otherwise the published adapter ships stale code.

## Architecture

Four independently built pieces end up in the npm package:

1. **Adapter backend** — `src/main.ts` → `build/main.js` (`main` in package.json). A single `EmailAdapter extends Adapter` class. Supports compact mode: when required as a module it exports a factory instead of self-starting.
2. **Admin config UI** — declarative `admin/jsonConfig.json` plus one React custom component built from `src-admin/` with Vite + Module Federation (federation name `ConfigCustomEmailSet`, exposes `./Components`). jsonConfig references it as `"url": "custom/customComponents.js"`, `"name": "ConfigCustomEmailSet/Components/Microsoft"`. Adding a component means exporting it from `src-admin/src/Components.tsx` and referencing that path in jsonConfig.
3. **javascript-adapter rules block** — `src-rules/src/ActionSendEmail.tsx` → `admin/rules/customRuleBlocks.js`, wired up via `common.javascriptRules` in `io-package.json`. `ActionSendEmail.compile()` emits the `sendTo(...)` source that the rule executes.
4. **Blockly block** — `src-blockly/` → `admin/blockly.js` (esbuild, `npm run build:blockly`, part of `npm run build`). The generated bundle is committed and excluded from eslint; edit the TypeScript source, never the bundle. It defines the `email` block; the attachment rows are dynamic (per-row **−** button, **+** button below, count serialized as `<mutation filecount="N">`, defaulting to 2 for blocks saved before the feature existed). Words live in `src-blockly/i18n/*.json` and are bundled into `Blockly.Words` at build time — `npm run translate` covers them via a second `-b` base file. See `src-blockly/README.md`.

### Message handling (`src/main.ts`)

`onMessage` dispatches three commands:
- `send` → `processMessage` → `sendEmail`. Deduplicates identical messages arriving within 1 s.
- `sendNotification` → js-controller notification system (`common.supportedMessages.notifications`); `buildMessageFromNotification` renders category/instance messages into a localized subject+text.
- `authMicrosoft` → returns the OAuth authorize URL to the admin UI.

### Transport resolution — the subtle part

`sendEmail(options, message)` takes optional per-call transport options; when absent it falls back to `config.transportOptions`. Several "services" are **not** passed to nodemailer as a service name but rewritten to explicit host/port/TLS settings (`web.de`, `1und1`/`ionos`, `t-online.de`, `ith`, `mail.ee`, `Office365`). An `auth` object with empty user *and* password is deleted so anonymous SMTP relays work. The transport instance is cached in `this.emailTransport` only for the config-based transport, and deliberately **not** reused for Office365, because every send must pick up a fresh OAuth access token.

### OAuth (Office365 only)

`src/lib/TokenRefresher.ts` holds the tokens in the instance state `microsoftTokens` (declared in `io-package.json` → `instanceObjects`). Refresh goes through the ioBroker OAuth proxy `https://oauth2.iobroker.in/microsoft` — no client secret lives in this repo. The adapter subscribes to that state, so when the admin UI (`src-admin/src/Microsoft.tsx`, which receives the token via `postMessage` from the OAuth popup) writes new tokens, the running instance picks them up without a restart. A timer refreshes ~3 min before expiry, capped at 10 min per tick.

## Conventions

- Formatting/linting comes from `@iobroker/eslint-config`: 4 spaces, single quotes, 120 columns, trailing commas, `arrowParens: 'avoid'`.
- Translations: `admin/i18n/*.json` (jsonConfig, `"i18n": true`), `src-admin/src/i18n/*.json` and `src-rules/src/i18n/*.json` (copied into `admin/custom/i18n` and `admin/rules/i18n` by `tasks.mts`). 11 languages; English is the source, `npm run translate` fills the rest.
- Changelog: add entries under the `### **WORK IN PROGRESS**` placeholder in `README.md`. `io-package.json` → `common.news` is generated from it by the release script — do not hand-edit both.
- The adapter is a `messaging`-type adapter with Sentry error reporting enabled via `common.plugins`.
