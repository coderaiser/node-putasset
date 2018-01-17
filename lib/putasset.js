'use strict';

const path = require('path');
const fs = require('fs');

const {waterfall} = require('async');
const GitHubApi = require('github');
const currify = require('currify/legacy');
const mime = require('mime-types');
const github = new GitHubApi({
    version: '3.0.0'
});

const release = currify(getReleaseId);
const upload = currify(uploadAsset);

module.exports = (token, {owner, repo, tag, filename}, callback) => {
    check(token, {owner, repo, tag, filename}, callback);
    
    github.authenticate({
        type: 'oauth',
        token,
    });
    
    waterfall([
        release(owner, repo, tag),
        upload(owner, repo, filename)
   ], callback);
};

function uploadAsset(owner, repo, filePath, data, fn) {
    const name = path.basename(filePath);
    
    github.repos.uploadAsset({
        url: data.upload_url,
        file: fs.createReadStream(filePath),
        contentType: mime.lookup(filePath),
        contentLength: fs.statSync(filePath).size,
        name,
        label: name,
        owner,
        repo,
    }, fn);
}

function getReleaseId(owner, repo, tag, fn) {
    github.repos.getReleaseByTag({
        owner,
        repo,
        tag
    }, (error, release) => {
        if (error)
            return fn(Object.assign({}, error, {
                message: `Release: {error.message}`
            }));
        
        fn(null, release.data);
    });
}

function check(token, {owner, repo, tag, filename}, callback) {
    const items = [
        {token, name: 'token'},
        {owner, name: 'owner'},
        {repo, name: 'repo'},
        {tag, name: 'tag'},
        {filename, name: 'filename'}
    ]
    
    items.filter((item) => {
        return typeof item[item.name] !== 'string';
    }).forEach(({name}) => {
        throw Error(`${name} must to be a string!`);
    });
    
    if (typeof callback !== 'function')
        throw Error('callback must to be function!');
}

