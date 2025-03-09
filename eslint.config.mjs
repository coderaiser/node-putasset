import {matchToFlat} from '@putout/eslint-flat';
import {defineConfig} from 'eslint/config';
import {safeAlign} from 'eslint-plugin-putout';

export const match = {
    'bin/**': {
        'no-process-exit': 'off',
    },
};

export default defineConfig([
    safeAlign, {
        rules: {
            'node/no-unsupported-features/node-builtins': 'off',
            'putout/objects-braces-inside-array': 'off',
        },
    },
    ...matchToFlat(match),
]);
