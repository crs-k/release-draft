import assert from 'assert'
import * as core from '@actions/core'
import {github, owner, repo} from './get-context'
import {getCommitish} from './get-commitish'

export async function createDraft(
  nextTag: string,
  nextReleaseType: string
): Promise<[number, string, string]> {
  core.info('Creating Release Draft...')
  let releaseId: number
  let html_url: string
  let upload_url: string
  let prereleaseBool: boolean
  let commitish: string
  if (nextReleaseType === 'production') {
    prereleaseBool = false
  } else {
    prereleaseBool = true
  }

  try {
    // Create release draft
    commitish = await getCommitish()
    const response = await github.rest.repos.createRelease({
      owner,
      repo,
      tag_name: nextTag,
      name: nextTag,
      target_commitish: commitish,
      draft: true,
      generate_release_notes: true,
      prerelease: prereleaseBool
    })

    releaseId = response.data.id
    html_url = response.data.html_url
    upload_url = response.data.upload_url

    assert(releaseId, 'Release ID cannot be empty')
    assert(html_url, 'HTML URL cannot be empty')
    assert(upload_url, 'Upload URL cannot be empty')
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
