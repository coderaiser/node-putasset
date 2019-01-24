'use strict';

const {promisify} = require('util');
const {basename} = require('path');
const fs = require('fs');
const stat = promisify(fs.stat);

const github = require('@octokit/rest')();
const mime = require('mime-types');
const tryToCatch = require('try-to-catch');

module.exports = async (token, {owner, repo, tag, filename}) => {
    check(token, {owner, repo, tag, filename});
    
    const type = 'oauth';
    github.authenticate({
        type,
        token,
    });
    
    const [url, {size}] = await Promise.all([
        getReleaseUrl(owner, repo, tag),
        stat(filename),
    ]);
    
    await uploadAsset({
        owner,
        repo,
        filename,
        size,
        url,
    });
    
    return getURL({
        owner,
        repo,
        tag,
        filename,
    });
};

function getURL({owner, repo, tag, filename}) {
    return [
        'https://github.com',
        owner,
        repo,
        'releases',
        'download',
        tag,
        basename(filename)
    ].join('/');
}

async function uploadAsset({owner, repo, filename, size, url}) {
    const name = basename(filename);
    
    return github.repos.uploadReleaseAsset({
        url,
        file: fs.createReadStream(filename),
        headers: {
            'content-type': mime.lookup(filename),
            'content-length': size,
        },
        name,
        owner,
        repo,
    });
}

async function getReleaseUrl(owner, repo, tag) {
    const [e, release] = await tryToCatch(github.repos.getReleaseByTag, {
        owner,
        repo,
        tag,
    });
    
    if (e)
        throw Error(`Release: ${e.message}`);
    
    return release.data.upload_url;
}

function check(token, {owner, repo, tag, filename}) {
    const items = [
        {token, name: 'token'},
        {owner, name: 'owner'},
        {repo, name: 'repo'},
        {tag, name: 'tag'},
        {filename, name: 'filename'}
    ];
    
    items.filter((item) => {
        return typeof item[item.name] !== 'string';
    }).forEach(({name}) => {
        throw Error(`${name} must be a string!`);
    });
}

