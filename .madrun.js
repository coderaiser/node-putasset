import {run} from 'madrun';

export default {
    'test': () => `tape 'test/**/*.js'`,
    'watch': () => 'nodemon --watch lib --watch test -d 0.3 --exec',
    'watch:test': () => run('watch', 'npm test'),
    'coverage': () => 'c8 npm test',
    'report': () => 'c8 report --reporter=lcov',
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
    'test:run': () => 'bin/putasset.js --filename ./README.md --repo node-putasset --owner coderaiser --tag "v`version`"',
};
