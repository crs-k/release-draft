import * as assert from 'assert'
import * as core from '@actions/core'
import {getOctokit} from '@actions/github'

export async function getDefaultBranch(
  repoToken: string,
  owner: string,
  repo: string
): Promise<string> {
  core.info('Retrieving the default branch name')
  const github = getOctokit(repoToken)
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

export async function getRecentRelease(
  repoToken: string,
  owner: string,
  repo: string
): Promise<[string, boolean, number]> {
  core.info('Retrieving the most recent release')
  const github = getOctokit(repoToken)
  let targetTag: string
  let prevDraft: boolean
  let prevReleaseId: number
  try {
    // Get the default branch from the repo info
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
  core.info(`tag_name: '${targetTag}'`)
  core.info(`draft: '${prevDraft}'`)
  core.info(`release id: '${prevReleaseId}'`)

  return data
}

export async function generateUpdatedReleaseNotes(
  repoToken: string,
  owner: string,
  repo: string,
  targetTag: string
): Promise<[string, string]> {
  core.info('Retrieving the most recent release')
  const github = getOctokit(repoToken)
  let updateName: string
  let updateBody: string
  try {
    // Get the default branch from the repo info
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
    core.info('Release Notes cannot be generated. Defaulting tag.')
    updateName = 'Unnamed'
    updateBody = 'Unnamed'
  }
  const data: [name: string, body: string] = [updateName, updateBody]
  // Print the previous release info
  core.info(`Generated name: '${updateName}'`)
  core.info(`Generated body: '${updateBody}'`)

  return data
}