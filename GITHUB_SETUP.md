# GitHub update instructions — 0.9.0

Repository: `https://github.com/Kirai124/Naruto-Module`

## Upload the new repository files

1. Extract `Naruto-Module-GitHub-0.9.0.zip` on your computer.
2. In the GitHub repository, select **Add file → Upload files**.
3. Upload `assets`, `data`, `scripts`, `styles`, `README.md`, `module.json`, and `GITHUB_SETUP.md` to the repository root.
4. Commit directly to `main` with a message such as `Add Sealed Beast Redux v0.9.0`.

The hidden `.github` folder may not be visible in Windows. Verify that the repository contains `.github/workflows/release.yml`. If it does not:

1. Select **Add file → Create new file**.
2. Enter `.github/workflows/release.yml` as the file name.
3. Copy the workflow from this package into the editor and commit it to `main`.

## Start the automatic release

1. Open **Releases**.
2. Select **Draft a new release**.
3. Choose **Create new tag** and enter `v0.9.0`.
4. Target the `main` branch.
5. Publish the release. Do not manually upload module assets.

The tag triggers the workflow. After it finishes, the release Assets must include:

- `module.json`
- `n5eb-classmod-library-0.9.0.zip`
- GitHub's two automatic source-code archives

## Repair or rerun the release

Open **Actions → Build Foundry Release → Run workflow**, enter `v0.9.0`, and run it. This recreates or replaces the two Foundry release assets from the current `main` branch.

## Foundry manifest URL

`https://github.com/Kirai124/Naruto-Module/releases/latest/download/module.json`

## 0.13.0 release

Tag the release as `v0.13.0` and attach `n5eb-classmod-library-0.13.0.zip`. This release fixes the ApplicationV2 Edo Tensei sheet controls and automatically repairs the Class Mod Arts Attack Bonus and Save DC on existing characters.

## 0.13.2 release

Tag the release as `v0.13.2` and attach `n5eb-classmod-library-0.13.2.zip`. This release adds the Normal / Elite / Solo tier picker and the redesigned dedicated Edo Tensei creators.
