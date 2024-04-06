import assert from 'assert'
import * as core from '@actions/core'
import {github, owner, repo} from './get-context'

export async function getDefaultBranch(): Promise<string> {
  core.info('Retrieving the default branch name...')
  let result: string
  try {
    // Get the default branch from the repo info
    const response = await github.rest.repos.get({owner, repo})
    result = response.data.default_branch
    assert(result, 'default_branch cannot be empty')
  } catch (err) {
    // Handle .wiki repo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((err as any)?.status === 404 && repo.toUpperCase().endsWith('.WIKI')) {
      result = 'main'
    }
    // Otherwise error
    else {
      if (err instanceof Error) core.setFailed(`Failed to update draft with reason ${err.message}`)
      result = ''
    }
  }

  // Print the default branch
  core.info(`Default branch: '${result}'`)

  return result
}
