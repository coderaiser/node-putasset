import tryToCatch from 'try-to-catch';
import test from 'supertape';
import putasset from '../lib/putasset.js';

const empty = () => {};

const owner = 'coderaiser';
const repo = 'putasset';
const tag = 'v1.0.0';

test('arguments: token', async (t) => {
    const [e] = await tryToCatch(putasset, 123, {
        owner,
        repo,
        tag,
    });
    
    t.equal(e.message, 'token must be a string!', 'should throw when token not string');
    t.end();
});

test('arguments: owner', async (t) => {
    const [e] = await tryToCatch(putasset, '', {repo}, empty);
    
    t.equal(e.message, 'owner must be a string!', 'should throw when token not string');
    t.end();
});

test('arguments: repo', async (t) => {
    const [e] = await tryToCatch(putasset, '', {owner}, empty);
    
    t.equal(e.message, 'repo must be a string!', 'should throw when repo not string');
    t.end();
});

test('arguments: tag', async (t) => {
    const [e] = await tryToCatch(putasset, '', {owner, repo}, empty);
    
    t.equal(e.message, 'tag must be a string!', 'should throw when tag not string');
    t.end();
});

test('arguments: filename', async (t) => {
    const [e] = await tryToCatch(putasset, '', {owner, repo, tag}, empty);
    
    t.equal(e.message, 'filename must be a string!', 'should throw when filename not string');
    t.end();
});
