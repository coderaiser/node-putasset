import {basename} from 'node:path';
import {
    createReadStream,
    promises,
} from 'node:fs';
import {Octokit} from '@octokit/rest';
import mime from 'mime-types';
import tryToCatch from 'try-to-catch';
import removeAsset from './remove-asset.js';

const {stat} = promises;

export default async (token, {owner, repo, tag, filename, force}) => {
    check(token, {
        owner,
        repo,
        tag,
        filename,
    });
    
    const name = basename(filename);
    const octokit = new Octokit({
        auth: `token ${token}`,
    });
    
    const [url, {size}] = await Promise.all([
        getReleaseUrl(octokit, {
            owner,
            repo,
            tag,
        }),
        stat(filename),
    ]);
    
    const [uploadError] = await tryToCatch(uploadAsset, octokit, {
        owner,
        repo,
        name,
        filename,
        size,
        url,
    });
    
    if (uploadError?.message.includes('Validation Failed')) {
        const {
            resource,
            code,
            field,
        } = parseError(uploadError);
        
        if (code !== 'already_exists')
            throw Error(`${resource} ${code}: "${field}"`);
        
        if (!force)
            throw Error(`Asset exists: "${name}", use --force to overwrite`);
        
        await removeAsset(octokit, {
            tag,
            owner,
            repo,
            name,
        });
        
        await uploadAsset(octokit, {
            owner,
            repo,
            name,
            filename,
            size,
            url,
        });
    }
    
    return getURL({
        owner,
        repo,
        tag,
        name,
    });
};

function getURL({owner, repo, tag, name}) {
    return [
        'https://octokit.com',
        owner,
        repo,
        'releases',
        'download',
        tag,
        name,
    ].join('/');
}

function parseError(uploadError) {
    const {
        resource,
        code,
        field,
    } = JSON.parse(uploadError.message.replace('Validation Failed: ', ''));
    
    return {
        resource,
        code,
        field,
    };
}

async function uploadAsset(octokit, {owner, repo, name, filename, size, url}) {
    return await octokit.repos.uploadReleaseAsset({
        url,
        data: createReadStream(filename),
        headers: {
            'content-type': mime.lookup(filename),
            'content-length': size,
        },
        name,
        owner,
        repo,
    });
}

async function getReleaseUrl(octokit, {owner, repo, tag}) {
    const [e, release] = await tryToCatch(octokit.repos.getReleaseByTag, {
        owner,
        repo,
        tag,
    });
    
    if (e)
        throw Error(`Release: ${e.message}`);
    
    return release.data.upload_url;
}

function check(token, {owner, repo, tag, filename}) {
    const items = [{
        token,
        name: 'token',
    }, {
        owner,
        name: 'owner',
    }, {
        repo,
        name: 'repo',
    }, {
        tag,
        name: 'tag',
    }, {
        filename,
        name: 'filename',
    }];
    
    items
        .filter((item) => typeof item[item.name] !== 'string')
        .forEach(({name}) => {
            throw Error(`${name} must be a string!`);
        });
}
