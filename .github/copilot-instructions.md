# ioBroker Email Adapter

ioBroker email adapter enables sending emails from ioBroker. This is a TypeScript-based adapter with a modular architecture including the main adapter code, admin UI (React/Vite), and rules/Blockly components.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Dependencies
- Install all dependencies for the main adapter and all submodules:
  - `npm ci` -- takes 5 seconds. Preferred for CI and clean builds. 
  - `npm install` -- takes 20 seconds. Use when updating dependencies.
  - `npm run npm` -- takes 65 seconds. NEVER CANCEL. Installs dependencies for main adapter, admin UI, and rules components. Set timeout to 120+ seconds.

### Build Process
- Build TypeScript only: `npm run tsc` -- takes 1.5 seconds.
- Complete build (recommended): `npm run build` -- takes 45 seconds. NEVER CANCEL. Compiles TypeScript and builds admin UI and rules components. Set timeout to 90+ seconds.
  - This runs TypeScript compilation AND builds the React/Vite admin UI AND builds the rules/Blockly components
  - Outputs: main adapter to `build/`, admin UI to `admin/custom/`, rules to `admin/rules/`

### Testing
- Package validation: `npm run test:package` -- takes 0.4 seconds. Validates package.json and io-package.json structure.
- Integration test: `npm run test:integration` -- takes 46 seconds. NEVER CANCEL. Runs full adapter in test ioBroker environment. Set timeout to 120+ seconds.
- DO NOT USE `npm test` -- fails due to dependency glob pattern issues. Use individual test commands instead.

### Linting and Code Quality
- Lint TypeScript files: `npx eslint -c eslint.config.mjs "src/**/*.ts"` -- takes 3.5 seconds.
- DO NOT USE `npm run lint` -- hangs due to glob pattern issues.
- Type checking: TypeScript compilation (`npm run tsc`) performs type checking.

## Validation

- ALWAYS run the full build process after making changes: `npm run build`
- ALWAYS run integration tests to ensure adapter functionality: `npm run test:integration`
- The integration test actually starts the adapter in a test ioBroker environment and validates it can start successfully.
- For functional testing, the adapter's core functionality is email sending via nodemailer, which requires external email service configuration.
- Run package tests before committing: `npm run test:package`
- VSCode is configured with ESLint and Prettier. Use "Format on Save" for automatic code formatting.

## Repository Structure

### Main Components
- `src/` - Main adapter TypeScript source code
- `src-admin/` - Admin UI React/Vite application  
- `src-rules/` - Rules/Blockly React/Vite application
- `build/` - Compiled TypeScript output (main adapter)
- `admin/custom/` - Built admin UI files
- `admin/rules/` - Built rules/Blockly files
- `test/` - Test files (package validation and integration tests)

### Key Files
- `package.json` - Main adapter dependencies and scripts
- `src-admin/package.json` - Admin UI dependencies
- `src-rules/package.json` - Rules component dependencies  
- `io-package.json` - ioBroker adapter configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint configuration
- `tasks.js` - Build orchestration script

### Build System
The adapter uses a modular build system:
1. `npm run npm` installs dependencies in all three modules
2. `npm run build` orchestrates building all components via `tasks.js`
3. Each component (main, admin, rules) can be built independently using task arguments

## Common Tasks

### Complete Development Setup
```bash
npm ci                    # 5 seconds
npm run npm              # 65 seconds - NEVER CANCEL, set 120+ sec timeout
npm run build            # 45 seconds - NEVER CANCEL, set 90+ sec timeout  
npm run test:integration # 46 seconds - NEVER CANCEL, set 120+ sec timeout
```

### Quick Iteration
```bash
npm run tsc              # 1.5 seconds - TypeScript only
npm run test:package     # 0.4 seconds - Quick validation
```

### Repository Root Contents
```
.
├── README.md
├── package.json
├── io-package.json
├── tsconfig.json
├── eslint.config.mjs
├── tasks.js
├── src/                 # Main adapter TypeScript source
├── src-admin/           # Admin UI React/Vite app
├── src-rules/           # Rules/Blockly React/Vite app
├── build/               # Compiled main adapter
├── admin/               # Built UI components
├── test/                # Tests
├── .github/workflows/   # CI configuration
└── .vscode/             # Editor configuration
```

### Dependencies Overview
- Main adapter: TypeScript with @iobroker/adapter-core, nodemailer, googleapis
- Admin UI: React 18, Vite 6, Material-UI, @iobroker/adapter-react-v5
- Rules: React 18, Vite 6, @iobroker/javascript-rules-dev
- Development: ESLint, TypeScript, Mocha, @iobroker/testing

## Critical Notes

- **NEVER CANCEL** long-running commands like `npm run npm` (65s), `npm run build` (45s), or `npm run test:integration` (46s)
- Always set timeouts of 90+ seconds for build commands and 120+ seconds for npm install/test commands
- The adapter requires Node.js >= 18 and js-controller >= 5.0.19
- Use `npm ci` for clean installations, `npm install` only when updating dependencies
- The integration test is the primary validation that the adapter works correctly
- DO NOT rely on `npm test` or `npm run lint` as they have configuration issues
- Always build all components with `npm run build` before testing changes
- The modular architecture requires building admin UI and rules components separately from the main adapter