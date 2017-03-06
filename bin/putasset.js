#!/usr/bin/env node

'use strict';

const putasset = require('..');
const readjson = require('readjson');
const check = require('checkup');
const tryCatch = require('try-catch');

const TOKEN = process.env.PUTASSET_TOKEN;

const argv = process.argv;
const args = require('minimist')(argv.slice(2), {
    string: ['repo', 'user', 'tag', 'filename', 'token'],
    boolean: ['loud'],
    alias: {
        v: 'version',
        h: 'help',
        r: 'repo',
        u: 'user',
        t: 'tag',
        f: 'filename',
        l: 'loud',
        tn: 'token'
    }
});

const argsEmpty = Object.keys(args).length === 1;

if (args.version)
    version();
else if (args.help || argsEmpty)
    help();
else
    main();

function main() {
    const home = require('os-homedir')();
    const path = require('path');
    const tokenPath = path.join(home, '.putasset.json');
    
    const repo = args.repo;
    const user = args.user;
    const tag = args.tag;
    const filename = path.join(process.cwd(), args.filename);
    const name = args.filename;
    
    if (args.loud)
        console.log(`Uploading file "${name}" to ${user}/${repo}@${tag}`);
    
    let token;
    const error = tryCatch(() => {
        check([
            repo,
            user,
            tag,
            name,
        ], [
            'repo',
            'user',
            'tag',
            'filename'
        ]);
         
        token = TOKEN || args.token || readjson.sync(tokenPath).token;
    });
    
    if (!error)
        putasset(token, {
            repo,
            owner: user,
            tag,
            filename,
        }, log);
    
    log(error);
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
    
    Object.keys(bin).forEach(function(name) {
        console.log(`  ${name} ${bin[name]}`);
    });
}

