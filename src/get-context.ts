import * as assert from 'assert'
import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'

const repoToken = core.getInput('repo-token', {required: true})
core.setSecret(repoToken)
const github = getOctokit(repoToken)
const {owner: owner, repo: repo} = context.repo

export async function getDefaultBranch(): Promise<string> {
  core.info('Retrieving the default branch name...')
  let result: string
  try {
    // Get the default branch from the repo info
    const response = await github.rest.repos.get({owner, repo})
    result = response.data.default_branch
    assert.ok(result, 'default_branch cannot be empty')
  } catch (err) {
    // Handle .wiki repo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((err as any)?.status === 404 && repo.toUpperCase().endsWith('.WIKI')) {
      result = 'main'
    }
    // Otherwise error
    else {
      throw err
    }
  }

  // Print the default branch
  core.info(`Default branch: '${result}'`)

  // Prefix with 'refs/heads'
  if (!result.startsWith('refs/')) {
    result = `refs/heads/${result}`
  }

  return result
}

export async function getRecentRelease(): Promise<[string, boolean, number]> {
  core.info('Retrieving the most recent release...')
  let targetTag: string
  let prevDraft: boolean
  let prevReleaseId: number
  try {
    // Get info from the most recent release
    const response = await github.rest.repos.listReleases({
      owner,
      repo,
      per_page: 1,
      page: 1
    })
    targetTag = response.data[0].tag_name
    prevDraft = response.data[0].draft
    prevReleaseId = response.data[0].id
    assert.ok(targetTag, 'tag_name cannot be empty')
    assert.ok(prevDraft, 'prevDraft cannot be empty')
    assert.ok(prevReleaseId, 'prevReleaseId cannot be empty')
  } catch (err) {
    core.info('Previous release cannot be found. Defaulting tag.')
    targetTag = '0.1.0'
    prevDraft = false
    prevReleaseId = 0
  }
  const data: [tag: string, draft: boolean, release_id: number] = [
    targetTag,
    prevDraft,
    prevReleaseId
  ]
  // Print the previous release info
  core.info(`Tag Name: '${targetTag}'`)
  core.info(`Draft: '${prevDraft}'`)
  core.info(`Release ID: '${prevReleaseId}'`)

  return data
}

export async function generateUpdatedReleaseNotes(targetTag: string): Promise<[string, string]> {
  core.info('Generating Release Notes...')
  let updateName: string
  let updateBody: string
  try {
    // Generate release notes
    const response = await github.rest.repos.generateReleaseNotes({
      owner,
      repo,
      tag_name: targetTag
    })

    updateName = response.data.name
    updateBody = response.data.body

    assert.ok(updateName, 'name cannot be empty')
    assert.ok(updateBody, 'body cannot be empty')
  } catch (err) {
    core.info('Release Notes failed to generate.')
    updateName = 'Unnamed'
    updateBody = 'Unnamed'
  }
  const data: [name: string, body: string] = [updateName, updateBody]
  // Print release notes
  core.info(`Generated name: '${updateName}'`)
  core.info(`Generated body: '${updateBody}'`)

  return data
}

export async function updateDraft(
  targetTag: string,
  updateName: string,
  updateBody: string,
  prevReleaseId: number
): Promise<[number, string, string]> {
  core.info('Updating Release Draft...')
  let releaseId: number
  let html_url: string
  let upload_url: string
  try {
    // Update draft
    const response = await github.rest.repos.updateRelease({
      owner,
      repo,
      release_id: prevReleaseId,
      tag_name: targetTag,
      name: updateName,
      body: updateBody,
      draft: true
    })

    releaseId = response.data.id
    html_url = response.data.html_url
    upload_url = response.data.upload_url

    assert.ok(releaseId, 'Release ID cannot be empty')
    assert.ok(html_url, 'HTML URL cannot be empty')
    assert.ok(upload_url, 'Upload URL cannot be empty')
  } catch (err) {
    if (err instanceof Error) core.setFailed(`Failed to update draft with reason ${err.message}`)
    releaseId = 0
    html_url = ''
    upload_url = ''
  }
  const data: [id: number, html_url: string, upload_url: string] = [releaseId, html_url, upload_url]
  // Print the previous release info & set output values
  core.info(`Release ID: '${releaseId}'`)
  core.info(`HTML URL: '${html_url}'`)
  core.info(`Upload URL: '${upload_url}'`)

  core.setOutput('id', releaseId)
  core.setOutput('html_url', html_url)
  core.setOutput('upload_url', upload_url)

  return data
}

export async function createDraft(nextTag: string): Promise<[number, string, string]> {
  core.info('Creating Release Draft...')
  let releaseId: number
  let html_url: string
  let upload_url: string
  try {
    //Find default branch
    const defaultBranch = await getDefaultBranch()
    const commitish = core.getInput('commitish', {required: false}) || defaultBranch
    // Create release draft
    const response = await github.rest.repos.createRelease({
      owner,
      repo,
      tag_name: nextTag,
      name: nextTag,
      target_commitish: commitish,
      draft: true,
      generate_release_notes: true
    })

    releaseId = response.data.id
    html_url = response.data.html_url
    upload_url = response.data.upload_url

    assert.ok(releaseId, 'Release ID cannot be empty')
    assert.ok(html_url, 'HTML URL cannot be empty')
    assert.ok(upload_url, 'Upload URL cannot be empty')
  } catch (err) {
    if (err instanceof Error) core.setFailed(`Failed to create draft with reason ${err.message}`)
    releaseId = 0
    html_url = ''
    upload_url = ''
  }
  const data: [id: number, html_url: string, upload_url: string] = [releaseId, html_url, upload_url]
  // Print the draft info & set output values
  core.info(`Release ID: '${releaseId}'`)
  core.info(`HTML URL: '${html_url}'`)
  core.info(`Upload URL: '${upload_url}'`)

  core.setOutput('id', releaseId)
  core.setOutput('html_url', html_url)
  core.setOutput('upload_url', upload_url)

  return data
}
