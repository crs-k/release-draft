import * as core from '@actions/core'
import {github, owner, repo} from './get-context'
import {getCommitish} from './get-commitish'

export async function getOpenPullRequestExists(): Promise<boolean> {
  let pullRequestsPending = 0
  let pullRequestsExists = false
  let commitish: string

  try {
    core.info('Retrieving active pull requests...')
    commitish = await getCommitish()
    // Get the open PRs of the default branch
    const response = await github.rest.pulls.list({
      owner,
      repo,
      state: 'open',
      base: commitish
    })

    pullRequestsPending = new Set(
      response.data.map(filteredPullRequests => filteredPullRequests.number)
    ).size

    if (pullRequestsPending > 0) {
      pullRequestsExists = true
    }
  } catch (err) {
    // Handle .wiki repo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((err as any)?.status === 404 && repo.toUpperCase().endsWith('.WIKI')) {
      pullRequestsExists = false
    }
    // Otherwise error
    else {
      if (err instanceof Error) core.setFailed(`Failed to retrieve pull requests: ${err.message}`)
      pullRequestsExists = false
    }
  }

  // Print the default branch
  core.info(`Pending Pull Requests: '${pullRequestsExists}'`)

  return pullRequestsExists
}
