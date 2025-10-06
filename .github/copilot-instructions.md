# ioBroker.email Adapter

ioBroker.email is a TypeScript-based email adapter for the ioBroker home automation platform. The adapter enables sending emails from ioBroker using various email services like Gmail, Outlook, Yahoo, and many others via nodemailer.

## Adapter Purpose and Features

The email adapter provides comprehensive email sending capabilities for ioBroker automation scenarios:

- **Email sending**: Send emails from scripts, rules, and automations using nodemailer
- **Multiple email services**: Supports 30+ email providers including Gmail, Outlook, Yahoo, and custom SMTP
- **OAuth2 authentication**: Secure authentication for modern email services like Outlook
- **Attachments support**: Send files, URLs, and embedded images as email attachments
- **HTML and text formats**: Support for both plain text and rich HTML email content
- **Blockly integration**: Visual scripting support for JavaScript adapter with email sending blocks
- **Rules integration**: React-based rules component for visual automation workflows
- **Admin interface**: React-based configuration UI for easy setup and management

The adapter integrates seamlessly with ioBroker's automation ecosystem, providing reliable email notifications for smart home events, system alerts, and custom automations.

## Pull Request Requirements

### Changelog Updates
- **MANDATORY**: Every PR must include changelog updates in README.md
- **Format**: Changelog entries must be single-line format (no multi-line entries)
- **Location**: Add new entries under the `### **WORK IN PROGRESS**` section in README.md
- **Structure**: Follow the existing format: `* (@username) Brief description of change`
- **Example**: `* (@copilot) Fixed SMTP relay anonymous access by ignoring user and password when empty`

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Build
- **Install dependencies**: `npm install` -- takes 20 seconds
- **Build the project**: `npm run build` -- takes 1 minute 45 seconds. NEVER CANCEL. Set timeout to 180+ seconds.
  - Compiles TypeScript (`src/` → `build/`)
  - Builds admin React UI (`src-admin/` → `admin/custom/`)
  - Builds rules React UI (`src-rules/` → `admin/rules/`)
  - Uses Module Federation architecture with Vite

### TypeScript Compilation
- **Compile TypeScript only**: `npm run tsc` -- takes 1-2 seconds
- **Type checking**: TypeScript configuration in `tsconfig.json` and `tsconfig.build.json`
- Main source files in `src/main.ts` (adapter entry point) and `src/lib/`

### Testing
- **Run package validation tests**: `npm run test:package` -- takes ~360ms, 40 tests
- **Run integration tests**: `npm run test:integration` -- takes 36-40 seconds. NEVER CANCEL. Set timeout to 90+ seconds.
  - Tests actual adapter startup and termination
  - Validates adapter can connect to ioBroker infrastructure
- **IMPORTANT**: Main `npm run test` command has issues with node_modules test discovery. Use specific test commands instead.

### Linting
- **Lint TypeScript files**: `npx eslint src/**/*.ts` -- takes 3 seconds
- **IMPORTANT**: The main `npm run lint` command may hang. Use specific file patterns instead.
- Uses `@iobroker/eslint-config` configuration

### Development Workflow
- **Clean build**: Delete `build/`, `admin/custom/`, `admin/rules/` directories before building
- **Admin UI development**: 
  - Source in `src-admin/` (React + TypeScript + Vite)
  - Run `cd src-admin && npm install && npm run build` -- takes ~25 seconds
- **Rules UI development**:
  - Source in `src-rules/` (React + TypeScript + Vite)  
  - Run `cd src-rules && npm install && npm run build` -- takes ~16 seconds
- **Blockly integration**: 
  - Email sending blocks for JavaScript adapter visual scripting
  - Configuration in `admin/blockly.js`
- **Rules and Admin components**: Both written in React with TypeScript and Vite build system

## Validation

### Build Validation
- ALWAYS run `npm install` first after cloning or switching branches
- ALWAYS run `npm run build` after making TypeScript changes
- Build warnings about large chunks (>500KB) are NORMAL and expected
- Vite build warnings about eval usage in Module Federation are NORMAL

### Testing Validation
- ALWAYS run `npm run test:package` to validate package.json and io-package.json consistency
- ALWAYS run `npm run test:integration` to validate adapter startup after making changes to core functionality
- Integration test confirms the adapter can start, connect to ioBroker infrastructure, and terminate cleanly

### Manual Validation Scenarios
- **Cannot test actual email sending** without configuring email credentials and SMTP servers
- **Build artifact validation**: Verify `build/main.js`, `admin/custom/`, and `admin/rules/` are generated correctly
- **Configuration UI validation**: Admin UI components should build without errors (inspect `admin/custom/` output)
- **Rules UI validation**: Rules components should build without errors (inspect `admin/rules/` output)

### Pre-commit Validation
- ALWAYS run `npx eslint src/**/*.ts` before committing TypeScript changes
- ALWAYS run `npm run build` to ensure compilation succeeds
- ALWAYS run `npm run test:package` to validate package files
- Check that build artifacts are properly generated in `build/`, `admin/custom/`, and `admin/rules/`

### Build Artifacts Committing
- **IMPORTANT**: Build artifacts in `admin/custom/`, `admin/rules/`, and `src-rules/build/` directories should be committed to the repository
- These pre-built UI components are required for the adapter to function in ioBroker
- After running `npm run build`, always commit the generated artifacts along with source code changes
- This ensures that users installing the adapter get the latest UI components without needing to build them locally

## Common Tasks

### Project Structure
```
.
├── README.md                   # Project documentation
├── package.json               # Main project dependencies and scripts
├── io-package.json            # ioBroker adapter configuration
├── tsconfig.json              # TypeScript configuration
├── tsconfig.build.json        # TypeScript build configuration
├── eslint.config.mjs          # ESLint configuration
├── tasks.js                   # Build task runner for admin/rules components
├── src/                       # Main TypeScript source code
│   ├── main.ts               # Adapter entry point
│   ├── types.d.ts            # TypeScript type definitions
│   └── lib/                  # Utility libraries
├── src-admin/                 # Admin UI React components
│   ├── package.json          # Admin UI dependencies
│   ├── src/                  # React source code
│   └── build/                # Vite build output
├── src-rules/                 # Rules UI React components
│   ├── package.json          # Rules UI dependencies
│   ├── src/                  # React source code
│   └── build/                # Vite build output
├── build/                     # TypeScript compilation output
├── admin/                     # ioBroker admin interface files
│   ├── blockly.js            # Blockly blocks for JavaScript adapter
│   ├── custom/               # Built admin UI components
│   └── rules/                # Built rules UI components
└── test/                      # Test files
    ├── package.js            # Package validation tests
    └── integration.js        # Integration tests
```

### Key Files and Locations
- **Main adapter logic**: `src/main.ts` (EmailAdapter class)
- **Token management**: `src/lib/TokenRefresher.ts` (OAuth2 handling)
- **Type definitions**: `src/types.d.ts` (TypeScript interfaces)
- **Admin UI entry**: `src-admin/src/App.tsx` (React configuration UI)
- **Rules UI entry**: `src-rules/src/ActionSendEmail.tsx` (Rule system integration)
- **Blockly configuration**: `admin/blockly.js` (Email blocks for JavaScript adapter)
- **Build configuration**: `tasks.js` (coordinates multi-component builds)

### Frequently Used Commands Output

#### Repository Root Directory Listing
```bash
$ ls -la
total 576
drwxr-xr-x 11 runner docker   4096 .
drwxr-xr-x  3 runner docker   4096 ..
drwxr-xr-x  7 runner docker   4096 .git
drwxr-xr-x  4 runner docker   4096 .github
-rw-r--r--  1 runner docker    214 .gitignore
-rw-r--r--  1 runner docker    122 .releaseconfig.json
drwxr-xr-x  2 runner docker   4096 .vscode
-rw-r--r--  1 runner docker   2447 CHANGELOG_OLD.md
-rw-r--r--  1 runner docker   1099 LICENSE
-rw-r--r--  1 runner docker   5458 README.md
drwxr-xr-x  5 runner docker   4096 admin
drwxr-xr-x  3 runner docker   4096 build
-rw-r--r--  1 runner docker    933 eslint.config.mjs
-rw-r--r--  1 runner docker  15049 io-package.json
-rw-r--r--  1 runner docker 478177 package-lock.json
-rw-r--r--  1 runner docker   2803 package.json
-rw-r--r--  1 runner docker    238 prettier.config.mjs
drwxr-xr-x  3 runner docker   4096 src
drwxr-xr-x  3 runner docker   4096 src-admin
drwxr-xr-x  5 runner docker   4096 src-rules
-rw-r--r--  1 runner docker   3288 tasks.js
drwxr-xr-x  2 runner docker   4096 test
-rw-r--r--  1 runner docker    147 tsconfig.build.json
-rw-r--r--  1 runner docker   1163 tsconfig.json
```

#### Package.json Scripts Section
```json
"scripts": {
  "test:js": "mocha --config test/mocharc.custom.json \"{!(node_modules|test)/**/*.test.js,*.test.js,test/**/test!(PackageFiles|Startup).js}\"",
  "test:package": "mocha test/package --exit",
  "test:integration": "mocha test/integration --exit", 
  "test": "npm run test:js && npm run test:package",
  "tsc": "tsc -p tsconfig.build.json",
  "build": "tsc -p tsconfig.build.json && node tasks",
  "lint": "eslint -c eslint.config.mjs",
  "check": "tsc --noEmit -p tsconfig.check.json",
  "translate": "translate-adapter",
  "update-packages": "npx -y npm-check-updates --upgrade && cd src-admin && npx -y npm-check-updates --upgrade && cd ../src-rules && npx -y npm-check-updates --upgrade",
  "npm": "npm i && cd src-admin && npm i && cd ../src-rules && npm i",
  "release": "release-script"
}
```

## Technology Stack and Dependencies
- **Runtime**: Node.js >=18
- **Language**: TypeScript 5.8+
- **Framework**: ioBroker adapter-core 3.2+
- **Email**: nodemailer 6.10+
- **OAuth**: googleapis 146.0+ (for Microsoft integration)
- **Admin UI**: React 18 + Material-UI 6 + Vite 6 (React-based configuration interface)
- **Rules UI**: React 18 + Module Federation (React-based rules component for JavaScript adapter)
- **Blockly**: Visual scripting blocks for JavaScript adapter
- **Testing**: Mocha + @iobroker/testing 5.1+
- **Linting**: ESLint 9 + @iobroker/eslint-config

## Known Issues and Workarounds
- **Test command**: `npm run test` fails due to node_modules test discovery. Use `npm run test:package` and `npm run test:integration` separately.
- **Lint command**: `npm run lint` may hang. Use `npx eslint src/**/*.ts` for specific files.
- **Build warnings**: Large chunk warnings and eval warnings are normal and expected.
- **Check command**: `npm run check` fails because `tsconfig.check.json` is missing. Use `npm run tsc` for type checking.

## Critical Timeouts and Timing
- **NEVER CANCEL** any build or test commands before their expected completion time
- **npm install**: 20 seconds (set timeout: 60+ seconds)
- **npm run build**: 1 minute 45 seconds (set timeout: 180+ seconds) 
- **npm run test:integration**: 36-40 seconds (set timeout: 90+ seconds)
- **npm run test:package**: 360ms (set timeout: 30+ seconds)
- **npm run tsc**: 1-2 seconds (set timeout: 30+ seconds)
- **Admin UI build**: 25 seconds (set timeout: 60+ seconds)
- **Rules UI build**: 16 seconds (set timeout: 45+ seconds)

<tool_calling>
You have the capability to call multiple tools in a single response. For maximum efficiency, whenever you need to perform multiple independent operations, ALWAYS invoke all relevant tools simultaneously rather than sequentially. Especially when exploring repository, reading files, viewing directories, validating changes or replying to comments.
</tool_calling>