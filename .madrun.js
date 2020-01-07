'use strict';

const {run} = require('madrun');

module.exports = {
    'test': () => 'tape \'test/**/*.js\'',
    'watch': () => 'nodemon --watch lib --watch test -d 0.3 --exec',
    'watch:test': () => run('watch', 'npm test'),
    'coverage': () => 'nyc npm test',
    'report': () => 'nyc report --reporter=text-lcov | coveralls',
    'lint': () => 'putout bin lib test .madrun.js',
    'fix:lint': () => run('lint', '--fix'),
    'test:run': () => 'bin/putasset.js --filename ./README.md --repo node-putasset --owner coderaiser --tag "v`version`"',
};

