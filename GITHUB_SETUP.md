# GitHub update instructions — 0.12.0

Repository: `https://github.com/Kirai124/Naruto-Module`

## Upload the new repository files

1. Extract `Naruto-Module-GitHub-0.12.0.zip` on your computer.
2. Open the included `Naruto-Module` folder.
3. In the GitHub repository, select **Add file → Upload files**.
4. Upload the contents of that folder to the repository root and replace the existing files.
5. Commit directly to `main` with a message such as `Add Edo Tensei v0.12.0`.

Verify that `.github/workflows/release.yml` exists in the repository. The `.github` folder may be hidden on Windows.

## Start the automatic release

1. Open **Actions → Build Foundry Release**.
2. Select **Run workflow**.
3. Enter `v0.12.0` as the tag.
4. Run the workflow on `main`.

Alternatively, create and push the tag `v0.12.0`; the tag push starts the same workflow.

After the workflow finishes, release `v0.12.0` must contain:

- `module.json`
- `n5eb-classmod-library-0.12.0.zip`
- GitHub's two automatic source-code archives

## Foundry manifest URL

`https://github.com/Kirai124/Naruto-Module/releases/latest/download/module.json`
