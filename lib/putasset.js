'use strict';

const path = require('path');
const fs = require('fs');

const GitHubApi = require('github');
const mime = require('mime-types');
const github = new GitHubApi({
    version: '3.0.0'
});

const promisify = require('es6-promisify');
const fullstore = require('fullstore');
const wrap = require('wraptile');

const sizeStore = fullstore();
const urlStore = fullstore();

const getFileSize = wrap(promisify(_getFileSize));
const getReleaseUrl = wrap(promisify(_getReleaseUrl))
const uploadAsset = wrap(promisify(_uploadAsset));

module.exports = (token, {owner, repo, tag, filename}, callback) => {
    check(token, {owner, repo, tag, filename}, callback);
    
    github.authenticate({
        type: 'oauth',
        token,
    });
    
    const getUrl = getReleaseUrl(owner, repo, tag);
    const getSize = getFileSize(filename);
    
    const getInfo = Promise.all([
        getUrl(),
        getSize(),
    ])
    .then(uploadAsset(owner, repo, filename))
    .catch(callback);
};

function _getFileSize(name, fn) {
    fs.stat(name, (e, stat) => {
        if (stat)
            sizeStore(stat.size);
        
        fn(e);
    });
}

function _uploadAsset(owner, repo, filePath, fn) {
    const name = path.basename(filePath);
    
    github.repos.uploadAsset({
        url: urlStore(),
        file: fs.createReadStream(filePath),
        contentType: mime.lookup(filePath),
        contentLength: sizeStore(),
        name,
        label: name,
        owner,
        repo,
    }, fn);
}

function _getReleaseUrl(owner, repo, tag, fn) {
    github.repos.getReleaseByTag({
        owner,
        repo,
        tag
    }, (error, release) => {
        if (error)
            return fn(Object.assign({}, error, {
                message: `Release: ${error.message}`
            }));
        
        urlStore(release.data.upload_url);
        fn();
    });
}

function check(token, {owner, repo, tag, filename}, callback) {
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
        throw Error(`${name} must to be a string!`);
    });
    
    if (typeof callback !== 'function')
        throw Error('callback must to be function!');
}

