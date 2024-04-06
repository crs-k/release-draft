import assert from 'assert'
import * as core from '@actions/core'

export async function getReleaseType(previousTag: string): Promise<string> {
  let previousReleaseType: string

  try {
    if (previousTag.includes('alpha')) {
      previousReleaseType = 'alpha'
    } else if (previousTag.includes('beta')) {
      previousReleaseType = 'beta'
    } else {
      previousReleaseType = 'production'
    }

    assert(previousReleaseType, 'previous release type cannot be empty')
  } catch (err) {
    core.info('Failed to find previous release type.')
    previousReleaseType = ''
  }
  const data = previousReleaseType
  // Next tag
  core.info(`Previous Release Type: ${previousReleaseType}`)

  return data
}
