#!/usr/bin/env node

'use strict';

const home = require('os').homedir();
const {
    join,
    isAbsolute,
} = require('path');

const putasset = require('..');
const readjson = require('readjson');
const check = require('checkup');
const tryCatch = require('try-catch');

const TOKEN = process.env.PUTASSET_TOKEN;

const {argv} = process;
const args = require('yargs-parser')(argv.slice(2), {
    string: ['repo', 'owner', 'tag', 'filename', 'token'],
    boolean: ['loud', 'show-url', 'force'],
    alias: {
        v: 'version',
        h: 'help',
        r: 'repo',
        u: 'owner',
        o: 'owner',
        t: 'tag',
        f: 'filename',
        l: 'loud',
        k: 'token',
    },
});

const argsEmpty = Object.keys(args).length === 1;

if (args.version)
    version();
else if (args.help || argsEmpty)
    help();
else
    main();

function main() {
    if (!args.filename)
        exit(Error('filename could not be empty!'));
    
    const tokenPath = join(home, '.putasset.json');
    
    const {
        repo,
        owner,
        tag,
        force,
    } = args;
    
    const filename = getFileName(args.filename);
    const name = args.filename;
    
    if (args.loud)
        console.log(`Uploading file "${name}" to ${owner}/${repo}@${tag}`);
    
    let token;
    const [e] = tryCatch(() => {
        check([
            repo,
            owner,
            tag,
            name,
        ], [
            'repo',
            'owner',
            'tag',
            'filename',
        ]);
        
        token = TOKEN || args.token || readjson.sync(tokenPath).token;
    });
    
    if (e)
        exit(e);
    
    putasset(token, {
        repo,
        owner,
        tag,
        filename,
        force,
    })
        .then(showUrl)
        .catch(exit);
}

function showUrl(url) {
    if (!args.showUrl)
        return;
    
    console.log(url);
}

function exit(error) {
    log(error);
    process.exit(1);
}

function log(error) {
    if (error)
        console.error(error.message);
}

function version() {
    console.log('v' + info().version);
}

function info() {
    return require('../package');
}

function help() {
    const bin = require('../help');
    const usage = `Usage: ${info().name} [options]`;
    
    console.log(usage);
    console.log('Options:');
    
    for (const name of Object.keys(bin)) {
        console.log(`  ${name} ${bin[name]}`);
    }
}

function getFileName(filename) {
    if (isAbsolute(filename))
        return filename;
    
    return join(process.cwd(), args.filename);
}
