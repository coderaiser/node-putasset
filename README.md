# Putasset [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]

[NPMURL]: https://npmjs.org/package/putasset "npm"
[NPMIMGURL]: https://img.shields.io/npm/v/putasset.svg?style=flat
[LicenseURL]: https://tldrlegal.com/license/mit-license "MIT License"
[LicenseIMGURL]: https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[BuildStatusURL]: https://github.com/coderaiser/node-putasset/actions?query=workflow%3A%22Node+CI%22 "Build Status"
[BuildStatusIMGURL]: https://github.com/coderaiser/node-putasset/workflows/Node%20CI/badge.svg

Upload an asset to releases on GitHub.

## Install

```
npm i putasset -g
```

## How to use?

### Global

```
$ putasset
Usage: putasset [options]
Options:
  -h, --help      display this help and exit
  -v, --version   output version information and exit
  -r, --repo      name of repository
  -o, --owner     owner of repository
  -t, --tag       tag of repository (should exist!)
  -f, --filename  path to asset
  -k, --token     github token <https://github.com/settings/tokens/new>
  -l, --loud      output filename, repo, owner and tag before upload
  --show-url      show asset url
  --force         overwrite asset if one with same name already exist

$ PUTASSET_TOKEN="token" putasset \
-r putasset -o coderaiser -t v1.0.0 \
-f release.zip --show url

https://github.com/coderaiser/putasset/releases/download/v1.0.0/releases.zip
```

### Local

```
npm i putasset --save
```

Data will be read before execution in next order (left is more important):

`command line -> ~/.putasset.json`

### Example

```js
import putasset from 'putasset';

const token = 'token from https://github.com/settings/applications';

const url = await putasset(token, {
    owner: 'coderaiser',
    repo: 'putasset',
    tag: 'v1.0.0',
    filename: 'realease.zip',
});

console.log(`✅ Upload successfull, download url: ${url}`);
```

## Related

- [grizzly](https://github.com/coderaiser/node-grizzly "Grizzly") - Create release on github with help of node.

## License

MIT
