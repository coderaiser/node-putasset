#!/usr/bin/env node

'use strict';

const putasset  = require('..'),
    readjson    = require('readjson'),
    check       = require('checkup'),
    exec        = require('execon'),
    
    argv        = process.argv,
    args        = require('minimist')(argv.slice(2), {
        string: ['repo', 'user', 'tag', 'filename', 'token'],
        alias: {
            v: 'version',
            h: 'help',
            r: 'repo',
            u: 'user',
            t: 'tag',
            f: 'filename',
            tn: 'token'
        }
    }),
    
    argsEmpty   = Object.keys(args).length === 1;

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
    
    let token;
    const error = exec.try(function() {
        check([
            args.repo,
            args.user,
            args.tag,
            args.filename], [
            'repo',
            'user',
            'tag',
            'filename'
        ]);
         
        token = args.token || readjson.sync(tokenPath).token;
    });
    
    if (!error)
        putasset(token, {
            repo: args.repo,
            user: args.user,
            tag: args.tag,
            filename: args.filename
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

