# GitHub update instructions — 0.16.0

Repository: `https://github.com/Kirai124/Naruto-Module`

## Upload the new repository files

1. Extract `Naruto-Module-main-0.16.0.zip` on your computer.
2. In the GitHub repository, select **Add file → Upload files**.
3. Upload `.github`, `assets`, `data`, `scripts`, `styles`, `README.md`, `module.json`, and `GITHUB_SETUP.md` to the repository root.
4. Commit directly to `main`, for example with `Add Hashirama Cells and Crimson Priest icon update v0.16.0`.

The hidden `.github` folder may not be visible in Windows. Verify that the repository contains `.github/workflows/release.yml`.

## Start the automatic release

1. Open **Releases**.
2. Select **Draft a new release**.
3. Choose **Create new tag** and enter `v0.16.0`.
4. Target the `main` branch.
5. Publish the release. The workflow builds and uploads the Foundry ZIP automatically.

The release assets should contain:

- `module.json`
- `n5eb-classmod-library-0.16.0.zip`
- GitHub's automatic source-code archives

## Repair or rerun the release

Open **Actions → Build Foundry Release → Run workflow**, enter `v0.16.0`, and run it. The workflow recreates or replaces the Foundry release assets from the current `main` branch.

## Foundry manifest URL

`https://github.com/Kirai124/Naruto-Module/releases/latest/download/module.json`

## 0.16.0 notes

This release adds Crimson Priest, its Piety/Blood/Oath runtime automation, direct Art damage formulas, and retroactive damage migration for already-owned Heavenly Gates / Eight Gates Arts from earlier module versions.
