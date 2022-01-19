import * as assert from 'assert'
import * as core from '@actions/core'
import {github, owner, repo} from './get-context'

export async function createNotes(targetTag: string): Promise<[string, string]> {
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
