export default async (octokit, {owner, repo, tag, name}) => {
    const release = await octokit.repos.getReleaseByTag({
        owner,
        repo,
        tag,
    });
    
    const release_id = release.data.id;
    const assets = await octokit.repos.listReleaseAssets({
        owner,
        repo,
        release_id,
        per_page: 100,
    });
    
    for (const asset of assets.data)
        if (asset.name === name)
            return await octokit.repos.deleteReleaseAsset({
                owner,
                repo,
                asset_id: asset.id,
            });
};
