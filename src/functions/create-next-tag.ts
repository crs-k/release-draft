import * as assert from 'assert'
import * as core from '@actions/core'
import {ReleaseType} from 'semver'
import {bumpType} from './get-context'
import clean from 'semver/functions/clean'
import inc from 'semver/functions/inc'

let increaseType: ReleaseType

switch (bumpType) {
  case 'major':
    increaseType = 'major'
    break
  case 'minor':
    increaseType = 'minor'
    break
  case 'patch':
    increaseType = 'patch'
    break
}

export async function createNextTag(targetTag: string, nextReleaseType: string): Promise<string> {
  core.info('Generating Next tag...')
  let nextTag: string

  try {
    //bump version
    if (nextReleaseType === 'production') {
      const cleanTag = clean(targetTag) || ''
      const bumpTag = inc(cleanTag, increaseType)
      nextTag = `v${bumpTag}`
      assert.ok(bumpTag, 'next tag cannot be empty')
    } else {
      const cleanTag = clean(targetTag) || ''
      const bumpTag = inc(cleanTag, 'prerelease', nextReleaseType)
      nextTag = `v${bumpTag}`
      assert.ok(bumpTag, 'next tag cannot be empty')
    }
  } catch (err) {
    core.info('Next tag failed to generate. Defaulting to v0.1.0')
    nextTag = 'v0.1.0'
  }
  const data = nextTag
  // Next tag
  core.info(`Bump Type: ${increaseType.toString()}`)
  core.info(`Next tag: ${nextTag}`)

  return data
}
