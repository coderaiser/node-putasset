'use strict';

const path = require('path');
const {waterfall} = require('async');
const GitHubApi = require('github');
const currify = require('currify/legacy');
const github = new GitHubApi({
    version: '3.0.0'
});

const release = currify(getReleaseId);
const upload = currify(uploadAsset);

module.exports = (token, {owner, repo, tag, filename}, callback) => {
    check(token, {owner, repo, tag, filename}, callback);
    
    github.authenticate({
        type: 'oauth',
        token: token
    });
    
    waterfall([
        release(owner, repo, tag),
        upload(owner, repo, filename)
   ], callback);
};

function uploadAsset(owner, repo, filePath, id, fn) {
    const name = path.basename(filePath);
    
    github.repos.uploadAsset({
        id,
        name,
        owner,
        repo,
        filePath
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
        
        fn(null, release.data.id);
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

