import * as assert from 'assert'
import * as core from '@actions/core'
import {releaseStrategy} from './get-context'

export async function getNextReleaseType(previousReleaseType: string): Promise<string> {
  let nextReleaseType: string

  try {
    if (
      previousReleaseType === 'production' &&
      (releaseStrategy === 'triple' || releaseStrategy === 'double')
    ) {
      nextReleaseType = 'alpha'
    } else if (previousReleaseType === 'alpha' && releaseStrategy === 'triple') {
      nextReleaseType = 'beta'
    } else {
      nextReleaseType = 'production'
    }

    assert.ok(nextReleaseType, 'previous release type cannot be empty')
  } catch (err) {
    core.info('Failed to find previous release type.')
    nextReleaseType = ''
  }
  const data = nextReleaseType
  // Next tag
  core.info(`Next Release Type: ${nextReleaseType}`)

  return data
}
