# Release Process

This project uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

## Creating a Changeset

When you make changes that should trigger a release, create a changeset:

```bash
pnpm changeset
```

This will prompt you to:
1. Select which packages have changed
2. Choose the semver bump type (major/minor/patch) for each
3. Write a summary of the changes

The changeset will be saved in the `.changeset` directory.

### Semver Guidelines

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features (backwards compatible)
- **Patch** (1.0.0 → 1.0.1): Bug fixes

## Release Workflow

### Automated (Recommended)

1. Create and merge a PR with your changes + changeset
2. The GitHub Action will automatically:
   - Create a "Version Packages" PR with version bumps and changelog updates
   - When you merge that PR, publish all updated packages to npm

### Manual

If you need to publish manually:

```bash
# 1. Update versions based on changesets
pnpm version

# 2. Build and publish
pnpm release
```

**Note**: You need to be logged in to npm (`npm login`) and have publish permissions.

## Environment Setup

### GitHub Secrets

Add these secrets to your GitHub repository:

1. **NPM_TOKEN**: Your npm access token
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Create a new token with "Automation" type
   - Add to GitHub: Settings → Secrets → New repository secret

### Local Publishing

Create `~/.npmrc` with:

```
//registry.npmjs.org/:_authToken=YOUR_NPM_TOKEN
```

## Example Workflow

```bash
# 1. Make your changes
# edit files...

# 2. Create a changeset
pnpm changeset
# Select: @sanghyuk-2i/huh-core
# Type: patch
# Summary: "Fix variable substitution bug"

# 3. Commit and push
git add .
git commit -m "fix: variable substitution in templates"
git push

# 4. Wait for "Version Packages" PR to be created
# 5. Review and merge the PR
# 6. Packages are automatically published to npm! 🎉
```

## Troubleshooting

### "Version Packages" PR not created

- Check GitHub Actions logs
- Ensure you have a changeset in `.changeset/`
- Make sure the workflow has `GITHUB_TOKEN` permissions

### Publish failed

- Verify `NPM_TOKEN` is set in GitHub secrets
- Check you're logged in locally: `npm whoami`
- Ensure packages have `"publishConfig": { "access": "public" }`

### Version conflicts

If you get version conflicts:

```bash
# Reset local changes
git checkout main
git pull

# Run version command
pnpm version
```
