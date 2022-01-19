import * as assert from 'assert'
import * as core from '@actions/core'
import {github, owner, repo} from './get-context'

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
    assert.ok(prevReleaseId, 'prevReleaseId cannot be empty')
  } catch (err) {
    if (err instanceof Error)
      core.info(`Previous release cannot be found with reason ${err.message}. Defaulting tag.`)

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
