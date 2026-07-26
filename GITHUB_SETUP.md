# GitHub release setup

This repository is prepared for Foundry VTT updates.

## First release

1. Upload these files to the repository root.
2. Commit and push them to the default branch.
3. Create and push the tag `v0.8.2`.

Using GitHub Desktop:

- Repository → Create Tag → `v0.8.2`
- Push origin

Using Git:

```bash
git add .
git commit -m "Release 0.8.2"
git push
git tag v0.8.2
git push origin v0.8.2
```

The GitHub Action creates a Release containing:

- `module.json`
- `n5eb-classmod-library-0.8.2.zip`

## Foundry manifest URL

```text
https://github.com/Kirai124/Naruto-Module/releases/latest/download/module.json
```

## Future releases

1. Update `version` and `download` in `module.json`.
2. Commit and push.
3. Push a matching tag, for example `v0.8.3`.

The tag must exactly match the version with a leading `v`.
