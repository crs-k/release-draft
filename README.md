<p align="center">
  <a href="https://github.com/crs-k/release-draft/actions"><img alt="ci status" src="https://github.com/crs-k/release-draft/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/crs-k/release-draft/actions"><img alt="ci status" src="https://github.com/crs-k/release-draft/actions/workflows/codeql-analysis.yml/badge.svg"></a>
</p>

# Release Draft Create & Update

This Action automatically creates and/or updates release drafts.
* Generates & updates release notes using GitHub's Auto-generate release notes functionality. More info [here](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes).
* Draft tag defaults to previous semver compliant tag +1 patch. See inputs for more info.

## Usage

### Pre-requisites
Create a workflow `.yml` file in your repository's `.github/workflows` directory. An [example workflow](#example-workflow) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs
Inputs are defined in [`action.yml`](action.yml):

| Name | Description | Default |
| - | - | - |
| `repo-token` | Token to use to authorize label changes. Typically the GITHUB_TOKEN secret | N/A |
| `commitish` | Release target. | repository's default branch. |
| `bump` | Semver bump type. Options: major, minor, patch, premajor, preminor, prepatch, or prerelease. Only one version may be specified. | `patch`

### Outputs

* `id` - The ID of the created Release.
* `html_url` - The URL users can navigate to in order to view the release.
* `upload_url` - The URL for uploading assets to the release.

### Example workflow

```yaml
name: Release Draft

on:
  workflow_dispatch:
  push:
    branches:
      - main
  pull_request_target:
    branches:
      - main
  release:
      types: [published]

jobs:
  release_draft:
    runs-on: ubuntu-latest
    steps:
    - name: Release Draft
      uses: crs-k/release-draft@v0.3.3
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
```
#### Example Release Note Configuration

More info [here](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes#configuring-automatically-generated-release-notes).

```yaml
# .github/release.yml

changelog:
  exclude:
    labels:
      - ignore-for-release
    authors:
      - octocat
  categories:
    - title: Breaking Changes 🛠
      labels:
        - Semver-Major
        - breaking-change
    - title: Exciting New Features 🎉
      labels:
        - Semver-Minor
        - enhancement
    - title: Other Changes
      labels:
        - "*"
```
