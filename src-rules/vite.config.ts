import react from '@vitejs/plugin-react';
import commonjs from 'vite-plugin-commonjs';
import vitetsConfigPaths from 'vite-tsconfig-paths';
import { federation } from '@module-federation/vite';

const makeShared = pkgs => {
    const result = {};
    pkgs.forEach(packageName => {
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
            shared: makeShared(['react', '@iobroker/adapter-react-v5', 'react-dom', 'prop-types']),
        }),
        react(),
        vitetsConfigPaths(),
        commonjs(),
    ],
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
