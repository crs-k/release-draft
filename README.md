<p align="center">
  <a href="https://github.com/crs-k/release-draft/actions"><img alt="ci status" src="https://github.com/crs-k/release-draft/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/crs-k/release-draft/actions"><img alt="ci status" src="https://github.com/crs-k/release-draft/actions/workflows/codeql-analysis.yml/badge.svg"></a>
</p>

# Release Draft

This Action automatically creates and/or updates release drafts.
* Generates & updates release notes using GitHub's Auto-generate release notes functionality. More info [here](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes).
* Draft tag defaults to previous tag +1 patch version. See [inputs](https://github.com/crs-k/release-draft#inputs) for more info.
* See [example workflow](https://github.com/crs-k/release-draft#example-workflow).

## Usage

### Pre-requisites
Create a workflow `.yml` file in your repository's `.github/workflows` directory. An [example workflow](#example-workflow) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs
Inputs are defined in [`action.yml`](action.yml):

| Name | Required | Description | Default |
| ---- | -------- | ----------- | ------- |
| `repo-token` | `Yes`| Token to use to authenticate with GitHub API. [GITHUB_TOKEN](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#about-the-github_token-secret) suggested. | N/A |
| `commitish` | `No` | Target of release. | Default branch |
| `bump` | `No` | Version increase type. Options: `major`, `minor`, `patch`. | `patch`
| `release-strategy` | `No` | See [Release Strategies](#release-strategies) for more details. | `single`
| `publish-strategy` | `No` | See [Publish Strategies](#publish-strategies) for more details. | `manual`

### Outputs
Outputs are defined in [`action.yml`](action.yml):

| Name | Description |
| ---- | ----------- |
| `id` | The ID of the created Release. |
| `html_url` | The URL users can navigate to in order to view the release. |
| `upload_url` | The URL for uploading assets to the release. |

### Release Strategies
Inputs are defined in [`action.yml`](action.yml):

| Name | Description |
| ---- | ----------- |
| `single` | Assumes one release draft is active at a time. Release drafts will be created as a general release. Example: `v1.0.0` |
| `double` | Assumes two environments are in use. The first release draft will be flagged as a pre-release, followed by a general draft release once the pre-release is released. Example: `v1.0.0-alpha.0` followed by `v1.0.0` |
| `triple` | Assumes three environments are in use. This is similar to `double` but will add an additional pre-release between general releases. Example: `v1.0.0-alpha.0` followed by `v1.0.0-beta.0` followed by `v1.0.0` |

### Publish Strategies
Inputs are defined in [`action.yml`](action.yml):

| Name | Description |
| ---- | ----------- |
| `manual` | Default setting. Releases are created as drafts and not published. |
| `auto` | Draft releases will be published if no PRs are pending against `commitish`  |

## Example workflow

```yaml
# .github/workflows/release-draft.yml

name: Release Draft

on:
  workflow_dispatch:
  push:
    branches:
      - main
  release:
      types: [published]

permissions:
  contents: write

jobs:
  release_draft:
    runs-on: ubuntu-latest
    steps:
    - name: Release Draft
      uses: crs-k/release-draft@v0.6.1
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
      - "ignore for release ✂️"
  categories:
  - title: ☄️ Breaking Changes
    labels:
      - "breaking change ☄️"
  - title: 🎉 New Features 
    labels:
      - "enhancement 💎"
  - title: 🐛 Bug Fixes
    labels:
      - "bug 🐛"
  - title: 🧰 Maintenance
    labels: 
      - "chore 🧹"
      - "dependencies 🛠"
  - title: 📓 Documentation
    labels: 
      - "documentation 📓"
  - title: 🃏 Miscellaneous
    labels:
      - "*"
```

## Contributing
Contributions are welcomed. Please read the [contributing](https://github.com/crs-k/release-draft/blob/main/CONTRIBUTING.md).
