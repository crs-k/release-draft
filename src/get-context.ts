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
      result = 'master'
    }
    // Otherwise error
    else {
      throw err
    }
  }

  // Print the default branch
  core.info(`Default branch '${result}'`)

  // Prefix with 'refs/heads'
  if (!result.startsWith('refs/')) {
    result = `refs/heads/${result}`
  }

  return result
}
