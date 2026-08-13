/**
 * Builds the two React bundles that are shipped inside `admin/`:
 * - `src-admin/` -> `admin/custom/` (the jsonConfig custom component)
 * - `src-rules/` -> `admin/rules/`  (the javascript-adapter rule block)
 *
 * Executed directly by node (TypeScript type stripping): `node tasks.mts [--flag]`.
 * Type checking is configured in `tsconfig.tasks.json`.
 */
import { buildReact, copyFiles, deleteFoldersRecursive, npmInstall } from '@iobroker/build-tools';

const ROOT = import.meta.dirname;

function buildAdmin(): Promise<void> {
    return buildReact(`${ROOT}/src-admin/`, { rootDir: `${ROOT}/src-admin/`, vite: true });
}

function cleanAdmin(): void {
    deleteFoldersRecursive(`${ROOT}/admin/custom`);
    deleteFoldersRecursive(`${ROOT}/src-admin/build`);
}

function copyAllAdminFiles(): void {
    copyFiles(['src-admin/build/assets/*.css', '!src-admin/build/assets/src_bootstrap_*.css'], 'admin/custom/assets');
    copyFiles(['src-admin/build/assets/*.js'], 'admin/custom/assets');
    //copyFiles(['src-admin/build/static/js/*.map', '!src-admin/build/static/js/vendors*.map', '!src-admin/build/static/js/node_modules*.map'], 'admin/custom/static/js');
    copyFiles(['src-admin/build/assets/*.png'], 'admin/custom/assets');
    copyFiles(['src-admin/build/customComponents.js'], 'admin/custom');
    //copyFiles(['src-admin/build/customComponents.js.map'], 'admin/custom');
    copyFiles(['src-admin/src/i18n/*.json'], 'admin/custom/i18n');
}

function buildRules(): Promise<void> {
    return buildReact(`${ROOT}/src-rules/`, { rootDir: `${ROOT}/src-rules/`, vite: true, tsc: true });
}

function rulesClean(): void {
    deleteFoldersRecursive(`${ROOT}/admin/rules`);
    deleteFoldersRecursive(`${ROOT}/src-rules/build`);
}

function rulesCopy(): void {
    copyFiles(['src-rules/build/**/*', '!*.json'], 'admin/rules');
    copyFiles(['src-rules/src/i18n/*.json'], 'admin/rules/i18n');
}

function fail(message: string): (e: unknown) => never {
    return (e: unknown): never => {
        console.error(`${message}: ${e as string}`);
        process.exit(2);
    };
}

if (process.argv.includes('--rules-0-clean')) {
    rulesClean();
} else if (process.argv.includes('--rules-1-npm')) {
    npmInstall(`${ROOT}/src-rules/`).catch(fail('Cannot install src-rules'));
} else if (process.argv.includes('--rules-2-compile')) {
    buildRules().catch(fail('Cannot build src-rules'));
} else if (process.argv.includes('--rules-3-copy')) {
    rulesCopy();
} else if (process.argv.includes('--rules-build')) {
    rulesClean();
    npmInstall(`${ROOT}/src-rules/`)
        .then(() => buildRules())
        .then(() => rulesCopy())
        .catch(fail('Cannot build src-rules'));
} else if (process.argv.includes('--admin-0-clean')) {
    cleanAdmin();
} else if (process.argv.includes('--admin-1-npm')) {
    npmInstall(`${ROOT}/src-admin/`).catch(fail('Cannot install src-admin'));
} else if (process.argv.includes('--admin-2-compile')) {
    buildAdmin().catch(fail('Cannot build src-admin'));
} else if (process.argv.includes('--admin-3-copy')) {
    copyAllAdminFiles();
} else if (process.argv.includes('--admin-build')) {
    cleanAdmin();
    npmInstall(`${ROOT}/src-admin/`)
        .then(() => buildAdmin())
        .then(() => copyAllAdminFiles())
        .catch(fail('Cannot build src-admin'));
} else {
    cleanAdmin();
    rulesClean();
    npmInstall(`${ROOT}/src-admin/`)
        .then(() => buildAdmin())
        .then(() => copyAllAdminFiles())
        .then(() => npmInstall(`${ROOT}/src-rules/`))
        .then(() => buildRules())
        .then(() => rulesCopy())
        .catch(fail('Cannot build'));
}
