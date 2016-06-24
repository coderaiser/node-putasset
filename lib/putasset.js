'use strict';

const path = require('path');
const {waterfall} = require('async');
const GitHubApi = require('github');
const currify = require('currify');
const github = new GitHubApi({
    version: '3.0.0'
});

const release = currify(getReleaseId);
const upload = currify(uploadAsset);

module.exports = (token, {user, repo, tag, filename}, callback) => {
    check(token, {user, repo, tag, filename}, callback);
    
    github.authenticate({
        type: 'oauth',
        token: token
    });
    
    waterfall([
        release(user, repo, tag),
        upload(user, repo, filename)
   ], callback);
};

function uploadAsset(user, repo, filePath, id, fn) {
    const name = path.basename(filePath);
    
    github.repos.uploadAsset({
        id,
        name,
        user,
        repo,
        filePath
    }, fn);
}

function getReleaseId(user, repo, tag, fn) {
    github.repos.getReleaseByTag({
        user,
        repo,
        tag
    }, (error, release = {}) => {
        fn(error, release.id);
    });
}

function check(token, {user, repo, tag, filename}, callback) {
    const items = [
        {token, name: 'token'},
        {user, name: 'user'},
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

