const { deleteFoldersRecursive, buildReact, copyFiles, npmInstall } = require('@iobroker/build-tools');

function buildAdmin() {
    return buildReact(`${__dirname}/src-admin/`, { rootDir: `${__dirname}/src-admin/`, vite: true });
}

function cleanAdmin() {
    deleteFoldersRecursive(`${__dirname}/admin/custom`);
    deleteFoldersRecursive(`${__dirname}/src-admin/build`);
}

function copyAllAdminFiles() {
    copyFiles(['src-admin/build/assets/*.css', '!src-admin/build/assets/src_bootstrap_*.css'], 'admin/custom/assets');
    copyFiles(['src-admin/build/assets/*.js'], 'admin/custom/assets');
    //copyFiles(['src-admin/build/static/js/*.map', '!src-admin/build/static/js/vendors*.map', '!src-admin/build/static/js/node_modules*.map'], 'admin/custom/static/js');
    copyFiles(['src-admin/build/assets/*.png'], 'admin/custom/assets');
    copyFiles(['src-admin/build/customComponents.js'], 'admin/custom');
    //copyFiles(['src-admin/build/customComponents.js.map'], 'admin/custom');
    copyFiles(['src-admin/src/i18n/*.json'], 'admin/custom/i18n');
}

function rulesClean() {
    deleteFoldersRecursive(`${__dirname}/admin/rules`);
    deleteFoldersRecursive(`${__dirname}/src-rules/build`);
}

function rulesCopy() {
    copyFiles(['src-rules/build/**/*', '!*.json'], 'admin/rules');
    copyFiles(['src-rules/src/i18n/*.json'], 'admin/rules/i18n');
}

if (process.argv.includes('--rules-0-clean')) {
    rulesClean();
} else if (process.argv.includes('--rules-1-npm')) {
    npmInstall(`${__dirname}/src-rules/`).catch(e => {
        console.error(e);
        process.exit(2);
    });
} else if (process.argv.includes('--rules-2-compile')) {
    buildReact(`${__dirname}/src-rules/`, { rootDir: `${__dirname}/src-rules/`, vite: true, tsc: true }).catch(e => {
        console.error(e);
        process.exit(2);
    });
} else if (process.argv.includes('--rules-3-copy')) {
    rulesCopy();
} else if (process.argv.includes('--rules-build')) {
    rulesClean();
    npmInstall(`${__dirname}/src-rules/`)
        .then(() => buildReact(`${__dirname}/src-rules/`, { rootDir: `${__dirname}/src-rules/`, vite: true, tsc: true }))
        .then(() => rulesCopy())
        .catch(e => {
            console.error(e);
            process.exit(2);
        });
} else if (process.argv.includes('--admin-0-clean')) {
    cleanAdmin();
} else if (process.argv.includes('--admin-1-npm')) {
    npmInstall(`${__dirname}/src-admin/`).catch(e => console.error(e));
} else if (process.argv.includes('--admin-2-compile')) {
    buildAdmin().catch(e => console.error(e));
} else if (process.argv.includes('--admin-3-copy')) {
    copyAllAdminFiles();
} else if (process.argv.includes('--admin-build')) {
    cleanAdmin();
    npmInstall(`${__dirname}/src-admin/`)
        .then(() => buildAdmin())
        .then(() => copyAllAdminFiles())
        .catch(e => console.error(e));
} else {
    cleanAdmin();
    rulesClean();
    npmInstall(`${__dirname}/src-admin/`)
        .then(() => buildAdmin())
        .then(() => copyAllAdminFiles())
        .then(() => npmInstall(`${__dirname}/src-rules/`))
        .then(() => buildReact(`${__dirname}/src-rules/`, { rootDir: `${__dirname}/src-rules/`, vite: true, tsc: true }))
        .then(() => rulesCopy())
        .catch(e => console.error(e));
}
