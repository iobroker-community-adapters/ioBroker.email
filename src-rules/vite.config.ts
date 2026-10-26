import react from '@vitejs/plugin-react';
import commonjs from 'vite-plugin-commonjs';
import { federation } from '@module-federation/vite';

const makeShared = (pkgs: string[]): { [key: string]: { requiredVersion: string; singleton: boolean } } => {
    const result: { [key: string]: { requiredVersion: string; singleton: boolean } } = {};
    pkgs.forEach((packageName: string) => {
        result[packageName] = {
            requiredVersion: '*',
            singleton: true,
        };
    });
    return result;
};

const config = {
    plugins: [
        federation({
            manifest: true,
            name: 'ActionSendEmail',
            filename: 'customRuleBlocks.js',
            exposes: {
                './ActionSendEmail': './src/ActionSendEmail.tsx',
            },
            remotes: {},
            shared: makeShared(['react', '@iobroker/gui-components', 'react-dom', 'prop-types']),
        }),
        react(),
        commonjs(),
    ],
    resolve: {
        tsconfigPaths: true,
    },
    server: {
        port: 3000,
    },
    base: './',
    build: {
        target: 'chrome89',
        outDir: './build',
    },
};

export default config;
