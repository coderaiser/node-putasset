#!/usr/bin/env node

import {join, isAbsolute} from 'node:path';
import process from 'node:process';
import nodeOs from 'node:os';
import {createRequire} from 'node:module';
import readjson from 'readjson';
import check from 'checkup';
import tryCatch from 'try-catch';
import yargsParser from 'yargs-parser';
import putasset from '../lib/putasset.js';

const info = () => require('../package');
const require = createRequire(import.meta.url);
const {argv} = process;

const args = yargsParser(argv.slice(2), {
    string: [
        'repo',
        'owner',
        'tag',
        'filename',
        'token',
    ],
    boolean: [
        'loud',
        'show-url',
        'force',
    ],
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

const TOKEN = process.env.PUTASSET_TOKEN;
const home = nodeOs.homedir();
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
