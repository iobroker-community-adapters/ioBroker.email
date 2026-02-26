# ioBroker Adapter Development with GitHub Copilot

**Version:** 0.5.7
**Template Source:** https://github.com/DrozmotiX/ioBroker-Copilot-Instructions

This file contains instructions and best practices for GitHub Copilot when working on ioBroker adapter development.

---

## 📑 Table of Contents

1. [Project Context](#project-context)
2. [Code Quality & Standards](#code-quality--standards)
   - [Code Style Guidelines](#code-style-guidelines)
   - [ESLint Configuration](#eslint-configuration)
3. [Testing](#testing)
   - [Unit Testing](#unit-testing)
   - [Integration Testing](#integration-testing)
   - [API Testing with Credentials](#api-testing-with-credentials)
4. [Development Best Practices](#development-best-practices)
   - [Dependency Management](#dependency-management)
   - [HTTP Client Libraries](#http-client-libraries)
   - [Error Handling](#error-handling)
5. [Admin UI Configuration](#admin-ui-configuration)
   - [JSON-Config Setup](#json-config-setup)
   - [Translation Management](#translation-management)
6. [Documentation](#documentation)
   - [README Updates](#readme-updates)
   - [Changelog Management](#changelog-management)
7. [CI/CD & GitHub Actions](#cicd--github-actions)
   - [Workflow Configuration](#workflow-configuration)
   - [Testing Integration](#testing-integration)
8. [Adapter-Specific Development Patterns](#adapter-specific-development-patterns)

---

## Project Context

You are working on an ioBroker adapter. ioBroker is an integration platform for the Internet of Things, focused on building smart home and industrial IoT solutions. Adapters are plugins that connect ioBroker to external systems, devices, or services.

### ioBroker.email Adapter

ioBroker.email is a TypeScript-based email adapter for the ioBroker home automation platform. The adapter enables sending emails from ioBroker using various email services like Gmail, Outlook, Yahoo, and many others via nodemailer.

The adapter provides comprehensive email sending capabilities for ioBroker automation scenarios:

- **Email sending**: Send emails from scripts, rules, and automations using nodemailer
- **Multiple email services**: Supports 30+ email providers including Gmail, Outlook, Yahoo, and custom SMTP
- **OAuth2 authentication**: Secure authentication for modern email services like Outlook
- **Attachments support**: Send files, URLs, and embedded images as email attachments
- **HTML and text formats**: Support for both plain text and rich HTML email content
- **Blockly integration**: Visual scripting support for JavaScript adapter with email sending blocks
- **Rules integration**: React-based rules component for visual automation workflows
- **Admin interface**: React-based configuration UI for easy setup and management

#### Adapter-Specific Context
- **Adapter Name**: ioBroker.email
- **Primary Function**: Outbound email notifications for ioBroker automations and scripts
- **Key Dependencies**: nodemailer (email transport), googleapis (OAuth2 for Outlook), @iobroker/adapter-core
- **Configuration Requirements**: SMTP service selection, authentication credentials, optional OAuth2 for Outlook/Office365

#### Pull Request Requirements
- **MANDATORY**: Every PR must include changelog updates in README.md
- **Format**: Changelog entries must be single-line format (no multi-line entries)
- **Location**: Add new entries under the `### **WORK IN PROGRESS**` section in README.md
- **Structure**: Follow the existing format: `* (@username) Brief description of change`
- **Example**: `* (@copilot) Fixed SMTP relay anonymous access by ignoring user and password when empty`

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

---

## Code Quality & Standards

### Code Style Guidelines

- Follow JavaScript/TypeScript best practices
- Use async/await for asynchronous operations
- Implement proper resource cleanup in `unload()` method
- Use semantic versioning for adapter releases
- Include proper JSDoc comments for public methods

**Timer and Resource Cleanup Example:**
```javascript
private connectionTimer?: NodeJS.Timeout;

async onReady() {
  this.connectionTimer = setInterval(() => this.checkConnection(), 30000);
}

onUnload(callback) {
  try {
    if (this.connectionTimer) {
      clearInterval(this.connectionTimer);
      this.connectionTimer = undefined;
    }
    callback();
  } catch (e) {
    callback();
  }
}
```

### ESLint Configuration

**CRITICAL:** ESLint validation must run FIRST in your CI/CD pipeline, before any other tests. This "lint-first" approach catches code quality issues early.

#### Setup
```bash
npm install --save-dev eslint @iobroker/eslint-config
```

#### Configuration (.eslintrc.json)
```json
{
  "extends": "@iobroker/eslint-config",
  "rules": {
    // Add project-specific rule overrides here if needed
  }
}
```

#### Package.json Scripts
```json
{
  "scripts": {
    "lint": "eslint --max-warnings 0 .",
    "lint:fix": "eslint . --fix"
  }
}
```

#### Best Practices
1. ✅ Run ESLint before committing — fix ALL warnings, not just errors
2. ✅ Use `lint:fix` for auto-fixable issues
3. ✅ Don't disable rules without documentation
4. ✅ Lint all relevant files (main code, tests, build scripts)
5. ✅ Keep `@iobroker/eslint-config` up to date
6. ✅ **ESLint warnings are treated as errors in CI** (`--max-warnings 0`). The `lint` script above already includes this flag — run `npm run lint` to match CI behavior locally

#### Common Issues
- **Unused variables**: Remove or prefix with underscore (`_variable`)
- **Missing semicolons**: Run `npm run lint:fix`
- **Indentation**: Use 4 spaces (ioBroker standard)
- **console.log**: Replace with `adapter.log.debug()` or remove

---

## Testing

### Unit Testing

- Use Jest as the primary testing framework
- Create tests for all adapter main functions and helper methods
- Test error handling scenarios and edge cases
- Mock external API calls and hardware dependencies
- For adapters connecting to APIs/devices not reachable by internet, provide example data files

**Example Structure:**
```javascript
describe('AdapterName', () => {
  let adapter;
  
  beforeEach(() => {
    // Setup test adapter instance
  });
  
  test('should initialize correctly', () => {
    // Test adapter initialization
  });
});
```

### Integration Testing

**CRITICAL:** Use the official `@iobroker/testing` framework. This is the ONLY correct way to test ioBroker adapters.

**Official Documentation:** https://github.com/ioBroker/testing

#### Framework Structure

**✅ Correct Pattern:**
```javascript
const path = require('path');
const { tests } = require('@iobroker/testing');

tests.integration(path.join(__dirname, '..'), {
    defineAdditionalTests({ suite }) {
        suite('Test adapter with specific configuration', (getHarness) => {
            let harness;

            before(() => {
                harness = getHarness();
            });

            it('should configure and start adapter', function () {
                return new Promise(async (resolve, reject) => {
                    try {
                        const obj = await new Promise((res, rej) => {
                            harness.objects.getObject('system.adapter.your-adapter.0', (err, o) => {
                                if (err) return rej(err);
                                res(o);
                            });
                        });
                        
                        if (!obj) return reject(new Error('Adapter object not found'));

                        Object.assign(obj.native, {
                            position: '52.520008,13.404954',
                            createHourly: true,
                        });

                        harness.objects.setObject(obj._id, obj);
                        
                        await harness.startAdapterAndWait();
                        await new Promise(resolve => setTimeout(resolve, 15000));

                        const stateIds = await harness.dbConnection.getStateIDs('your-adapter.0.*');
                        
                        if (stateIds.length > 0) {
                            console.log('✅ Adapter successfully created states');
                            await harness.stopAdapter();
                            resolve(true);
                        } else {
                            reject(new Error('Adapter did not create any states'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            }).timeout(40000);
        });
    }
});
```

#### Key Rules

1. ✅ Use `@iobroker/testing` framework
2. ✅ Configure via `harness.objects.setObject()`
3. ✅ Start via `harness.startAdapterAndWait()`
4. ✅ Verify states via `harness.states.getState()`
5. ✅ Allow proper timeouts for async operations
6. ❌ NEVER test API URLs directly
7. ❌ NEVER bypass the harness system

#### Workflow Dependencies

Integration tests should run ONLY after lint and adapter tests pass:

```yaml
integration-tests:
  needs: [check-and-lint, adapter-tests]
  runs-on: ubuntu-22.04
```

### API Testing with Credentials

For adapters connecting to external APIs requiring authentication:

#### Password Encryption for Integration Tests

```javascript
async function encryptPassword(harness, password) {
    const systemConfig = await harness.objects.getObjectAsync("system.config");
    if (!systemConfig?.native?.secret) {
        throw new Error("Could not retrieve system secret for password encryption");
    }
    
    const secret = systemConfig.native.secret;
    let result = '';
    for (let i = 0; i < password.length; ++i) {
        result += String.fromCharCode(secret[i % secret.length].charCodeAt(0) ^ password.charCodeAt(i));
    }
    return result;
}
```

---

## Development Best Practices

### Dependency Management

- Always use `npm` for dependency management
- Use `npm ci` for installing existing dependencies (respects package-lock.json)
- Use `npm install` only when adding or updating dependencies
- Keep dependencies minimal and focused
- Only update dependencies in separate Pull Requests

**When modifying package.json:**
1. Run `npm install` to sync package-lock.json
2. Commit both package.json and package-lock.json together

**Best Practices:**
- Prefer built-in Node.js modules when possible
- Use `@iobroker/adapter-core` for adapter base functionality
- Avoid deprecated packages
- Document specific version requirements

### HTTP Client Libraries

- **Preferred:** Use native `fetch` API (Node.js 20+ required)
- **Avoid:** `axios` unless specific features are required

**Example with fetch:**
```javascript
try {
  const response = await fetch('https://api.example.com/data');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
} catch (error) {
  this.log.error(`API request failed: ${error.message}`);
}
```

**Other Recommendations:**
- **Logging:** Use adapter built-in logging (`this.log.*`)
- **Scheduling:** Use adapter built-in timers and intervals
- **File operations:** Use Node.js `fs/promises`
- **Configuration:** Use adapter config system

### Error Handling

- Always catch and log errors appropriately
- Use adapter log levels (error, warn, info, debug)
- Provide meaningful, user-friendly error messages
- Handle network failures gracefully
- Implement retry mechanisms where appropriate
- Always clean up timers, intervals, and resources in `unload()` method

**Example:**
```javascript
try {
  await this.connectToDevice();
} catch (error) {
  this.log.error(`Failed to connect to device: ${error.message}`);
  this.setState('info.connection', false, true);
  // Implement retry logic if needed
}
```

---

## Admin UI Configuration

### JSON-Config Setup

Use JSON-Config format for modern ioBroker admin interfaces.

**Example Structure:**
```json
{
  "type": "panel",
  "items": {
    "host": {
      "type": "text",
      "label": "Host address",
      "help": "IP address or hostname of the device"
    }
  }
}
```

**Guidelines:**
- ✅ Use consistent naming conventions
- ✅ Provide sensible default values
- ✅ Include validation for required fields
- ✅ Add tooltips for complex options
- ✅ Ensure translations for all supported languages (minimum English and German)
- ✅ Write end-user friendly labels, avoid technical jargon

**Note for ioBroker.email:** This adapter uses a React-based custom admin UI (not JSON-Config). The admin UI is in `src-admin/` and is built with React + Material-UI + Vite. The rules UI is in `src-rules/`.

### Translation Management

**CRITICAL:** Translation files must stay synchronized with admin UI configuration. Orphaned keys or missing translations cause UI issues and PR review delays.

#### Critical Rules
1. ✅ Keys must match exactly with configuration
2. ✅ No orphaned keys in translation files
3. ✅ All translations must be in native language (no English fallbacks)
4. ✅ Keys must be sorted alphabetically

---

## Documentation

### README Updates

#### Required Sections
1. **Installation** - Clear npm/ioBroker admin installation steps
2. **Configuration** - Detailed configuration options with examples
3. **Usage** - Practical examples and use cases
4. **Changelog** - Version history (use "## **WORK IN PROGRESS**" for ongoing changes)
5. **License** - License information (typically MIT for ioBroker adapters)
6. **Support** - Links to issues, discussions, community support

#### Documentation Standards
- Use clear, concise language
- Include code examples for configuration
- Add screenshots for admin interface when applicable
- Maintain multilingual support (minimum English and German)
- Always reference issues in commits and PRs (e.g., "fixes #xx")

#### Mandatory README Updates for PRs

For **every PR or new feature**, always add a user-friendly entry to README.md:

- Add entries under `### **WORK IN PROGRESS**` section
- Use format: `* (@username) Brief description of change`
- Focus on user impact, not technical details

### Changelog Management

Follow the [AlCalzone release-script](https://github.com/AlCalzone/release-script) standard.

#### Format Requirements

```markdown
# Changelog

<!--
  Placeholder for the next version (at the beginning of the line):
  ### **WORK IN PROGRESS**
-->

### **WORK IN PROGRESS**
* (author) Added new feature X
* (author) Fixed bug Y (fixes #25)

### v0.1.0 (2023-01-01)
Initial release
```

#### Workflow Process
- **During Development:** All changes go under `### **WORK IN PROGRESS**`
- **For Every PR:** Add user-facing changes to WORK IN PROGRESS section
- **Before Merge:** Version number and date added when merging to main
- **Release Process:** Release-script automatically converts placeholder to actual version

#### Change Entry Format
- Format: `* (@username) User-friendly description`
- Focus on user impact, not technical implementation
- Reference issues: "fixes #XX" or "solves #XX"

---

## CI/CD & GitHub Actions

### Workflow Configuration

#### GitHub Actions Best Practices

**Must use ioBroker official testing actions:**
- `ioBroker/testing-action-check@v1` for lint and package validation
- `ioBroker/testing-action-adapter@v1` for adapter tests
- `ioBroker/testing-action-deploy@v1` for automated releases with Trusted Publishing (OIDC)

**Configuration:**
- **Node.js versions:** Test on 20.x, 22.x, 24.x
- **Platform:** Use ubuntu-22.04
- **Automated releases:** Deploy to npm on version tags (requires NPM Trusted Publishing)
- **Monitoring:** Include Sentry release tracking for error monitoring

#### Critical: Lint-First Validation Workflow

**ALWAYS run ESLint checks BEFORE other tests.** Benefits:
- Catches code quality issues immediately
- Prevents wasting CI resources on tests that would fail due to linting errors
- Provides faster feedback to developers
- Enforces consistent code quality

**Workflow Dependency Configuration:**
```yaml
jobs:
  check-and-lint:
    # Runs ESLint and package validation
    # Uses: ioBroker/testing-action-check@v1
    
  adapter-tests:
    needs: [check-and-lint]  # Wait for linting to pass
    # Run adapter unit tests
    
  integration-tests:
    needs: [check-and-lint, adapter-tests]  # Wait for both
    # Run integration tests
```

**Key Points:**
- The `check-and-lint` job has NO dependencies - runs first
- ALL other test jobs MUST list `check-and-lint` in their `needs` array
- If linting fails, no other tests run, saving time
- Fix all ESLint errors before proceeding

### Testing Integration

#### Testing Best Practices
- Run credential tests separately from main test suite
- Don't make credential tests required for deployment
- Provide clear failure messages for API issues
- Use appropriate timeouts for external calls (120+ seconds)

---

## Adapter-Specific Development Patterns

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

### Testing Commands
- **Run package validation tests**: `npm run test:package` -- takes ~360ms, 40 tests
- **Run integration tests**: `npm run test:integration` -- takes 36-40 seconds. NEVER CANCEL. Set timeout to 90+ seconds.
  - Tests actual adapter startup and termination
  - Validates adapter can connect to ioBroker infrastructure
- **IMPORTANT**: Main `npm run test` command has issues with node_modules test discovery. Use specific test commands instead.

### Linting
- **Lint TypeScript files**: `npx eslint src/**/*.ts` -- takes 3 seconds
- **IMPORTANT**: The main `npm run lint` command may hang. Use specific file patterns instead.
- Uses `@iobroker/eslint-config` configuration

### Admin and Rules UI Development
- **Admin UI development**: Source in `src-admin/` (React + TypeScript + Vite). Run `cd src-admin && npm install && npm run build` -- takes ~25 seconds
- **Rules UI development**: Source in `src-rules/` (React + TypeScript + Vite). Run `cd src-rules && npm install && npm run build` -- takes ~16 seconds
- **Blockly integration**: Email sending blocks for JavaScript adapter visual scripting, configured in `admin/blockly.js`
- Both admin and rules components use React with TypeScript and Vite build system

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

### Package.json Scripts Reference
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

### Technology Stack and Dependencies
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

### Known Issues and Workarounds
- **Test command**: `npm run test` fails due to node_modules test discovery. Use `npm run test:package` and `npm run test:integration` separately.
- **Lint command**: `npm run lint` may hang. Use `npx eslint src/**/*.ts` for specific files.
- **Build warnings**: Large chunk warnings and eval warnings are normal and expected.
- **Check command**: `npm run check` fails because `tsconfig.check.json` is missing. Use `npm run tsc` for type checking.

### Critical Timeouts and Timing
- **NEVER CANCEL** any build or test commands before their expected completion time
- **npm install**: 20 seconds (set timeout: 60+ seconds)
- **npm run build**: 1 minute 45 seconds (set timeout: 180+ seconds)
- **npm run test:integration**: 36-40 seconds (set timeout: 90+ seconds)
- **npm run test:package**: 360ms (set timeout: 30+ seconds)
- **npm run tsc**: 1-2 seconds (set timeout: 30+ seconds)
- **Admin UI build**: 25 seconds (set timeout: 60+ seconds)
- **Rules UI build**: 16 seconds (set timeout: 45+ seconds)