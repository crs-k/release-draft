import * as assert from 'assert'
import * as core from '@actions/core'

export async function getReleaseType(previousTag: string): Promise<string> {
  let prevReleaseType: string

  try {
    if (previousTag.includes('alpha')) {
      prevReleaseType = 'alpha'
    } else if (previousTag.includes('beta')) {
      prevReleaseType = 'beta'
    } else {
      prevReleaseType = 'production'
    }

    assert.ok(prevReleaseType, 'next tag cannot be empty')
  } catch (err) {
    core.info('Failed to find previous release type.')
    prevReleaseType = ''
  }
  const data = prevReleaseType
  // Next tag
  core.info(`Next tag: ${prevReleaseType}`)

  return data
}
