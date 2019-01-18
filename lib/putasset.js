'use strict';

const {promisify} = require('util');
const path = require('path');
const fs = require('fs');
const stat = promisify(fs.stat);

const github = require('@octokit/rest')();
const mime = require('mime-types');
const tryToCatch = require('try-to-catch');

module.exports = async (token, {owner, repo, tag, filename, force}) => {
    check(token, {owner, repo, tag, filename});
    
    const type = 'oauth';
    github.authenticate({
        type,
        token,
    });

    if(force)
        await deleteReleaseAssetIfExist({
            owner,
            repo,
            tag,
            filename,
            force
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

    return [
        "https://github.com",
        owner,
        repo,
        "releases",
        "download",
        tag, 
        path.basename(filename)
    ].join('/');

};

async function deleteReleaseAssetIfExist({owner, repo, tag, filename}) {
    const file_basename = path.basename(filename);

    const asset_id = await (async () => {

        const per_page = 100;

        for (let page = 1;; page++) {

            const {data: releases} = await github.repos.listReleases({
                owner,
                repo,
                per_page,
                page
            });

            const asset = releases
                .find(({tag_name}) => tag_name === tag)
                .assets
                .find(({name}) => name === file_basename)
                ;

            if (asset)
                return asset.id;

            if (releases.length < per_page)
                return undefined;
        }

    })();

    if (asset_id === undefined)
        return;

    await github.repos.deleteReleaseAsset({
        owner,
        repo,
        asset_id
    });

}

async function uploadAsset({ owner, repo, filename, size, url }) {
    const name = path.basename(filename);

    try {
        return await github.repos.uploadReleaseAsset({
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

    } catch (error) {
        try {
            if (error.errors[0].code === "already_exists") {
                error = new Error([
                    `Asset ${name} already exist in`,
                    `this release, use --force to overwrite.`
                ].join(' '));
            }
        } catch (_error) { }

        throw error;
    }
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

