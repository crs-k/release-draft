import assert from 'assert'
import * as core from '@actions/core'
import {releaseStrategy} from './get-context'

export async function getNextReleaseType(previousReleaseType: string): Promise<string> {
  let nextReleaseType = ''

  try {
    if (releaseStrategy === 'single') {
      nextReleaseType = 'production'
    } else if (previousReleaseType === 'production') {
      if (releaseStrategy === 'triple') {
        nextReleaseType = 'alpha'
      } else if (releaseStrategy === 'double') {
        nextReleaseType = 'beta'
      }
    } else if (previousReleaseType === 'alpha' && releaseStrategy === 'triple') {
      nextReleaseType = 'beta'
    } else if (previousReleaseType === 'beta' && releaseStrategy === 'double') {
      nextReleaseType = 'production'
    } else {
      nextReleaseType = 'production'
    }

    assert(nextReleaseType, 'next release type cannot be empty')
  } catch (err) {
    core.info('Failed to find next release type.')
    nextReleaseType = ''
  }
  const data = nextReleaseType
  // Next tag
  core.info(`Next Release Type: ${nextReleaseType}`)

  return data
}
