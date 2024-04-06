import assert from 'assert'
import * as core from '@actions/core'
import {github, owner, repo} from './get-context'

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
    assert(targetTag, 'tag_name cannot be empty')
    assert(prevReleaseId, 'prevReleaseId cannot be empty')
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
